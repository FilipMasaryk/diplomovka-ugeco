import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './schemas/userSchema';
import { UserRole } from '../common/enums/userRoleEnum';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  createUserSchema,
  CreateUserDto,
} from 'src/users/schemas/createUserSchema';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { EmailService } from './email.service';
import { UpdateUserDto } from './schemas/updateUserSchema';
import { Package } from 'src/packages/schemas/packageSchema';
import { Brand, BrandDocument } from 'src/brands/schemas/brandSchema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Package.name) private readonly packageModel: Model<Package>,
    @InjectModel(Brand.name) private readonly brandModel: Model<Brand>,
    private emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser: User): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) throw new BadRequestException('Email already in use');

    if (
      createUserDto.package &&
      !mongoose.Types.ObjectId.isValid(createUserDto.package)
    ) {
      throw new BadRequestException('Package ID is not a valid ObjectId');
    }

    if (createUserDto.brands) {
      const invalidBrandIds = createUserDto.brands.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id),
      );
      if (invalidBrandIds.length > 0) {
        throw new BadRequestException(
          `Invalid brand IDs: ${invalidBrandIds.join(', ')}`,
        );
      }
    }
    //console.log('Current:', currentUser.countries);
    //console.log('Assign:', createUserDto.countries);

    //kontrola ci subadmin priraduje len take krajiny, ktorymi je sucastou aj on
    if (currentUser.role === UserRole.SUBADMIN && createUserDto.countries) {
      const allowedCountries = currentUser.countries ?? [];

      const invalidCountries = createUserDto.countries.filter(
        (country) => !allowedCountries.includes(country),
      );

      if (invalidCountries.length > 0) {
        throw new ForbiddenException(
          `You cannot assign countries: ${invalidCountries.join(', ')}`,
        );
      }
    }

    const packageObj = createUserDto.package
      ? await this.packageModel.findById(createUserDto.package)
      : undefined;

    if (createUserDto.package && !packageObj) {
      throw new NotFoundException(
        `Package with ID ${createUserDto.package} not found`,
      );
    }

    //Kontroluje ci vsetky poslane IDcka su validne
    if (
      (createUserDto.role === UserRole.BRAND_MANAGER ||
        createUserDto.role === UserRole.SUBADMIN) &&
      createUserDto.brands &&
      createUserDto.brands.length > 0
    ) {
      const existingBrands = await this.brandModel.find({
        _id: { $in: createUserDto.brands },
        isArchived: false,
      });
      const existingBrandIds = existingBrands.map((b) => b._id.toString());
      const invalidBrands = createUserDto.brands.filter(
        (brandId) => !existingBrandIds.includes(brandId),
      );
      if (invalidBrands.length > 0) {
        throw new NotFoundException(
          `Brand(s) not found: ${invalidBrands.join(', ')}`,
        );
      }
    }

    //Kontroluje ci subadmin priraduje len take znacky, ku ktorym ma on pristup
    if (
      currentUser.role === UserRole.SUBADMIN &&
      createUserDto.brands &&
      createUserDto.brands.length > 0
    ) {
      const allowedBrandIds =
        currentUser.brands?.map((b) => b.toString()) ?? [];

      const forbiddenBrands = createUserDto.brands.filter(
        (brandId) => !allowedBrandIds.includes(brandId),
      );

      if (forbiddenBrands.length > 0) {
        throw new ForbiddenException(
          `You cannot assign brands: ${forbiddenBrands.join(', ')}`,
        );
      }
    }

    const initToken = crypto.randomBytes(32).toString('hex');
    const hashedInitToken = crypto
      .createHash('sha256')
      .update(initToken)
      .digest('hex');

    const brandIds =
      createUserDto.brands?.map((id) => new mongoose.Types.ObjectId(id)) || [];

    const createdUser = new this.userModel({
      ...createUserDto,
      package: packageObj,
      brands: brandIds,
      password: '',
      initToken: hashedInitToken,
      initTokenExpires: new Date(Date.now() + 1000 * 60 * 60), // platnost 1 hodina
    });

    await createdUser.save();

    // poslanie emailu s odkazom
    await this.emailService.sendInitEmail(createdUser.email, initToken);

    return createdUser;
  }

  async createPasswordResetToken(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = hashedToken;
    //PLatnost tokenu 10 min
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 10);
    await user.save();

    await this.emailService.sendResetEmail(user.email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userModel.findOne({
      resetPasswordToken: hashedToken,
      // pozre ci reset token neni expired
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
  }

  async initializePassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userModel.findOne({
      initToken: hashedToken,
      initTokenExpires: { $gt: new Date() },
    });

    if (!user) throw new BadRequestException('Invalid or expired token');

    user.password = await bcrypt.hash(newPassword, 10);
    user.initToken = undefined;
    user.initTokenExpires = undefined;

    await user.save();
  }

  //vrati len nearchivovanych pouzivatelov
  async findAll(): Promise<User[]> {
    return this.userModel
      .find({ isArchived: false })
      .select('-password')
      .populate('package')
      .populate('brands')
      .exec();
  }

  //vrati len nearchivovaneho pouzivatela podla id
  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findById({ _id: id, isArchived: false })
      .select('-password')
      .populate('package')
      .populate('brands')
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findArchived() {
    return this.userModel.find({ isArchived: true }).select('-password').exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: User,
  ): Promise<User> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email) {
      const emailExists = await this.userModel.findOne({
        email: updateUserDto.email,
        _id: { $ne: id },
      });
      if (emailExists) {
        throw new BadRequestException('Email already in use');
      }
    }

    if (
      updateUserDto.package &&
      !mongoose.Types.ObjectId.isValid(updateUserDto.package)
    ) {
      throw new BadRequestException('Package ID is not a valid ObjectId');
    }

    if (updateUserDto.brands) {
      const invalidBrandIds = updateUserDto.brands.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id),
      );
      if (invalidBrandIds.length > 0) {
        throw new BadRequestException(
          `Invalid brand IDs: ${invalidBrandIds.join(', ')}`,
        );
      }
    }

    if (currentUser.role === UserRole.SUBADMIN && updateUserDto.countries) {
      const allowedCountries = currentUser.countries ?? [];
      const invalidCountries = updateUserDto.countries.filter(
        (country) => !allowedCountries.includes(country),
      );
      if (invalidCountries.length > 0) {
        throw new ForbiddenException(
          `You cannot assign countries: ${invalidCountries.join(', ')}`,
        );
      }
    }

    const packageObj = updateUserDto.package
      ? await this.packageModel.findById(updateUserDto.package)
      : undefined;

    if (updateUserDto.package && !packageObj) {
      throw new NotFoundException(
        `Package with ID ${updateUserDto.package} not found`,
      );
    }

    //Kontroluje ci vsetky poslane IDcka su validne
    if (
      (updateUserDto.role === UserRole.BRAND_MANAGER ||
        updateUserDto.role === UserRole.SUBADMIN) &&
      updateUserDto.brands &&
      updateUserDto.brands.length > 0
    ) {
      const existingBrands = await this.brandModel.find({
        _id: { $in: updateUserDto.brands },
        isArchived: false,
      });
      const existingBrandIds = existingBrands.map((b) => b._id.toString());
      const invalidBrands = updateUserDto.brands.filter(
        (brandId) => !existingBrandIds.includes(brandId),
      );
      if (invalidBrands.length > 0) {
        throw new NotFoundException(
          `Brand(s) not found: ${invalidBrands.join(', ')}`,
        );
      }
    }

    //Kontroluje ci subadmin priraduje len take znacky, ku ktorym ma on pristup
    if (
      currentUser.role === UserRole.SUBADMIN &&
      updateUserDto.brands &&
      updateUserDto.brands.length > 0
    ) {
      const allowedBrandIds =
        currentUser.brands?.map((b) => b.toString()) ?? [];

      const forbiddenBrands = updateUserDto.brands.filter(
        (brandId) => !allowedBrandIds.includes(brandId),
      );

      if (forbiddenBrands.length > 0) {
        throw new ForbiddenException(
          `You cannot assign brands: ${forbiddenBrands.join(', ')}`,
        );
      }
    }

    const brandIds =
      updateUserDto.brands?.map((id) => new mongoose.Types.ObjectId(id)) || [];

    Object.assign(user, {
      ...updateUserDto,
      package: packageObj,
      brands: brandIds,
    });

    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword as User;
  }

  //nevymazava pouzivatela, len archivuje
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.isArchived) {
      throw new BadRequestException('User is already archived');
    }

    user.isArchived = true;
    user.archivedAt = new Date();
    await user.save();

    return { message: `User ${user.email} was archived.` };
  }

  //obnova archivovaneho pouzivatela
  async restore(id: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!user.isArchived) {
      throw new BadRequestException('User is not archived');
    }

    user.isArchived = false;
    user.archivedAt = undefined;
    await user.save();

    return { message: `User ${user.email} has been restored.` };
  }
}

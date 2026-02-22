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
import { Package, PackageType } from 'src/packages/schemas/packageSchema';
import { Brand, BrandDocument } from 'src/brands/schemas/brandSchema';
import { UpdateSelfDto } from './schemas/updateSelfSchema';
import { UpdateBrandManagerDto } from './schemas/updateBrandManagerSchema';
import { CreateBrandManagerDto } from './schemas/createBrandManagerSchema';

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

    if (currentUser.role === UserRole.SUBADMIN && createUserDto.role) {
      const allowedRoles = [
        UserRole.CREATOR,
        UserRole.BRAND_MANAGER,
        UserRole.SUBADMIN,
      ];
      if (!allowedRoles.includes(createUserDto.role)) {
        throw new ForbiddenException(
          `Subadmin cannot assign role: ${createUserDto.role}`,
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

    if (packageObj && packageObj.type !== PackageType.CREATOR) {
      throw new BadRequestException(
        `You can only assign a package of type "creator" to a user`,
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

    if (currentUser.role === UserRole.SUBADMIN && createUserDto.brands) {
      const brands = await this.brandModel.find({
        _id: { $in: createUserDto.brands },
        isArchived: false,
      });

      // overenie, že brandy majú krajiny zhodné s krajinami používateľa
      const invalidBrandsByCountry = brands
        .filter(
          (brand) =>
            !brand.country || !currentUser.countries!.includes(brand.country),
        )
        .map((b) => b._id.toString());

      if (invalidBrandsByCountry.length > 0) {
        throw new ForbiddenException(
          `Cannot assign brands that do not share a country with the subadmin: ${invalidBrandsByCountry.join(
            ', ',
          )}`,
        );
      }
    }

    const initToken = crypto.randomBytes(32).toString('hex');
    const hashedInitToken = crypto
      .createHash('sha256')
      .update(initToken)
      .digest('hex');

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const brandIds =
      createUserDto.brands?.map((id) => new mongoose.Types.ObjectId(id)) || [];

    const createdUser = new this.userModel({
      ...createUserDto,
      package: packageObj,
      brands: brandIds,
      password: hashedPassword,
      //initToken: hashedInitToken,
      //initTokenExpires: new Date(Date.now() + 1000 * 60 * 60), // platnost 1 hodina
    });

    await createdUser.save();

    // poslanie emailu s odkazom
    //await this.emailService.sendInitEmail(createdUser.email, initToken);

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
  async findAll(country?: string, role?: string): Promise<User[]> {
    const query: any = { isArchived: false };
    if (role) {
      query.role = role;
    }

    if (country) {
      query.countries = country;
    }

    return this.userModel
      .find(query)
      .select('-password')
      .populate('package')
      .populate('brands')
      .populate('profile')
      .exec();
  }

  //vrati len nearchivovaneho pouzivatela podla id
  async findOne(id: string): Promise<User> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('User ID is not a valid ObjectId');
    }
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

  async findArchived(country?: string, role?: string): Promise<User[]> {
    const query: any = { isArchived: true };

    if (role) {
      query.role = role;
    }

    if (country) {
      query.countries = country;
    }

    return this.userModel
      .find(query)
      .select('-password')
      .populate('package')
      .populate('brands')
      .populate('profile')
      .exec();
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
    if (currentUser.role === UserRole.SUBADMIN && updateUserDto.role) {
      const allowedRoles = [
        UserRole.CREATOR,
        UserRole.BRAND_MANAGER,
        UserRole.SUBADMIN,
      ];
      if (!allowedRoles.includes(updateUserDto.role)) {
        throw new ForbiddenException(
          `Subadmin cannot update user to role: ${updateUserDto.role}`,
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

    // Subadmin kontrola či priraduje len take znacky ktore su sucastou krajiny ktoru priraduje
    if (currentUser.role === UserRole.SUBADMIN && updateUserDto.brands) {
      if (user.countries && user.countries.length > 0) {
        const brands = await this.brandModel.find({
          _id: { $in: updateUserDto.brands },
          isArchived: false,
        });

        const invalidBrandsByCountry = brands
          .filter((brand) => !user.countries!.includes(brand.country))
          .map((b) => b._id.toString());

        if (invalidBrandsByCountry.length > 0) {
          throw new ForbiddenException(
            `Cannot assign brands that do not share a country with the user: ${invalidBrandsByCountry.join(
              ', ',
            )}`,
          );
        }
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

    let purchasedAtToSet: Date | undefined;

    if (packageObj) {
      const currentRole = updateUserDto.role ?? user.role;

      const currentPackageId = user.package?.toString();
      const newPackageId = packageObj._id.toString();

      if (
        currentRole === UserRole.CREATOR &&
        (!currentPackageId || currentPackageId !== newPackageId)
      ) {
        purchasedAtToSet = new Date();
      }
    }

    if (packageObj && packageObj.type !== PackageType.CREATOR) {
      throw new BadRequestException(
        'User can only have a package of type "creator"',
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

    const brandIds =
      updateUserDto.brands?.map((id) => new mongoose.Types.ObjectId(id)) || [];

    Object.assign(user, {
      ...updateUserDto,
      package: packageObj,
      brands: brandIds,
      ...(purchasedAtToSet && { purchasedAt: purchasedAtToSet }),
    });

    //console.log(user);
    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword as User;
  }

  //nevymazava pouzivatela, len archivuje
  async archive(id: string): Promise<{ message: string }> {
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

  async updateSelf(userId: string, dto: UpdateSelfDto): Promise<User> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (dto.email) {
      const emailExists = await this.userModel.findOne({
        email: dto.email,
        _id: { $ne: userId },
      });

      if (emailExists) {
        throw new BadRequestException('Email already in use');
      }
    }
    if (dto.name) user.name = dto.name;
    if (dto.surName) user.surName = dto.surName;
    if (dto.ico !== undefined) user.ico = dto.ico;
    if (dto.email) user.email = dto.email;

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword as User;
  }

  async getLoggedInUser(id: number): Promise<User> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('User ID is not a valid ObjectId');
    }
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

  async createBrandManager(
    dto: CreateBrandManagerDto,
    brandId: string,
    currentUser: User,
  ): Promise<User> {
    const brand = await this.brandModel.findById(brandId);
    if (!brand || brand.isArchived) {
      throw new NotFoundException('Brand not found');
    }

    if (
      currentUser.role === UserRole.SUBADMIN &&
      (!currentUser.countries || !currentUser.countries.includes(brand.country))
    ) {
      throw new ForbiddenException(
        'Cannot assign this brand due to country restriction',
      );
    }

    if (
      currentUser.role === UserRole.BRAND_MANAGER &&
      (!currentUser.brands ||
        !currentUser.brands.some((b) => b.toString() === brand._id.toString()))
    ) {
      throw new ForbiddenException(
        'You cannot assign managers to a brand you do not manage',
      );
    }

    let user = await this.userModel.findOne({ email: dto.email });
    if (user) {
      if (user.role === UserRole.CREATOR) {
        throw new ForbiddenException(
          'Cannot assign brands or modify a user with role CREATOR',
        );
      }
      if (!user.brands) user.brands = [];
      if (!user.countries) user.countries = [];

      if (!user.brands.some((b) => b.toString() === brand._id.toString())) {
        user.brands.push(brand._id);
      }
      if (!user.countries.includes(brand.country)) {
        user.countries.push(brand.country);
      }

      await user.save();
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword as User;
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    user = new this.userModel({
      name: dto.name,
      surName: dto.surName,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.BRAND_MANAGER,
      brands: [brand._id],
      countries: [brand.country],
    });

    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword as User;
  }

  async updateBrandManager(
    id: string,
    dto: UpdateBrandManagerDto,
    currentUser: User,
  ): Promise<User> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (user.role !== UserRole.BRAND_MANAGER) {
      throw new BadRequestException('User is not a Brand Manager');
    }

    if (dto.name) user.name = dto.name;
    if (dto.surName) user.surName = dto.surName;

    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword as User;
  }

  async archiveBrandManager(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid user ID');

    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (user.role !== UserRole.BRAND_MANAGER) {
      throw new BadRequestException(
        'Cant archive an user that is not a Brand Manager',
      );
    }
    user.isArchived = true;
    await user.save();
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword as User;
  }

  async removeBrandAccess(
    userId: string,
    brandId: string,
    currentUser: User,
  ): Promise<User> {
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(brandId)
    ) {
      throw new BadRequestException('Invalid user ID or brand ID');
    }

    const user = await this.userModel.findById(userId).populate('brands');
    if (!user) throw new NotFoundException('User not found');

    const brandObjectId = new mongoose.Types.ObjectId(brandId);

    const brand = await this.brandModel.findById(brandId);
    if (!brand) throw new NotFoundException('Brand not found');

    if (currentUser.role === UserRole.SUBADMIN) {
      if (!currentUser.countries?.includes(brand.country)) {
        throw new ForbiddenException(
          'Subadmin cannot remove access for a brand outside their countries',
        );
      }
    } else if (currentUser.role === UserRole.BRAND_MANAGER) {
      if (!currentUser.brands?.some((b) => b.toString() === brandId)) {
        throw new ForbiddenException(
          'You cannot remove access from a brand you do not manage',
        );
      }
    }

    const brandIndex = user.brands.findIndex(
      (b) => b._id.toString() === brandId,
    );
    if (brandIndex === -1) {
      throw new BadRequestException('User does not have access to this brand');
    }

    user.brands.splice(brandIndex, 1);

    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword as User;
  }

  async restoreBrandManager(userId: string): Promise<User> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (!user.isArchived) {
      throw new BadRequestException('User is not archived');
    }

    if (user.role !== UserRole.BRAND_MANAGER) {
      throw new BadRequestException('User is not a Brand Manager');
    }

    user.isArchived = false;
    user.archivedAt = undefined;

    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword as User;
  }

  async getBrandManagersByBrand(brandId: string): Promise<User[]> {
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      throw new BadRequestException('Invalid brand ID');
    }

    const brandObjectId = new mongoose.Types.ObjectId(brandId);
    const managers = await this.userModel
      .find({
        role: UserRole.BRAND_MANAGER,
        isArchived: false,
        brands: brandObjectId,
      })
      .select('-password')
      .exec();

    return managers;
  }
}

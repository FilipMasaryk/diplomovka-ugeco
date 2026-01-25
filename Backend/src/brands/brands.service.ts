import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Brand } from './schemas/brandSchema';
import { Package } from 'src/packages/schemas/packageSchema';
import { User, UserDocument } from 'src/users/schemas/userSchema';
import mongoose, { Model } from 'mongoose';
import { CreateBrandDto } from './schemas/createBrandSchema';
import { UpdateBrandDto } from './schemas/updateBrandSchema';
import { Country } from 'src/common/enums/countryEnum';
import { UserRole } from 'src/common/enums/userRoleEnum';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name)
    private readonly brandModel: Model<Brand>,

    @InjectModel(Package.name)
    private readonly packageModel: Model<Package>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async create(createBrandDto: CreateBrandDto, user: User): Promise<Brand> {
    const { package: packageId, mainContact, country } = createBrandDto;

    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      throw new BadRequestException('Package ID is not a valid ObjectId');
    }

    const packageObj = await this.packageModel.findById(packageId);
    if (!packageObj) {
      throw new NotFoundException(`Package with ID ${packageId} not found`);
    }

    if (mainContact) {
      if (!mongoose.Types.ObjectId.isValid(mainContact)) {
        throw new BadRequestException('Main contact ID is not valid');
      }

      const mainContactUser = await this.userModel.findById(mainContact);

      if (!mainContactUser) {
        throw new NotFoundException('Main contact user not found');
      }

      if (
        !mainContactUser.countries ||
        !mainContactUser.countries.includes(country)
      ) {
        throw new BadRequestException(
          'Main contact must have the brand country assigned',
        );
      }
    }

    const brand = new this.brandModel({
      ...createBrandDto,
      package: packageObj._id,
    });

    return brand.save();
  }

  async findAll(): Promise<Brand[]> {
    return this.brandModel.find({ isArchived: false }).exec();
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandModel.findOne({
      _id: id,
      isArchived: false,
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async findByIds(ids: string[]): Promise<Brand[]> {
    return this.brandModel
      .find({
        _id: { $in: ids },
        isArchived: false,
      })
      .exec();
  }

  async findOneForUser(id: string, user: User): Promise<Brand> {
    const brand = await this.brandModel.findOne({
      _id: id,
      isArchived: false,
    });
    if (!brand) throw new NotFoundException('Brand not found');
    if (!user.brands.includes(brand._id)) {
      throw new ForbiddenException('You do not have access to this brand');
    }
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Brand ID is not a valid ObjectId');
    }

    const brand = await this.brandModel.findById(id);
    if (!brand) throw new NotFoundException('Brand not found');

    if (updateBrandDto.package) {
      if (!mongoose.Types.ObjectId.isValid(updateBrandDto.package)) {
        throw new BadRequestException('Package ID is not a valid ObjectId');
      }

      const packageObj = await this.packageModel.findById(
        updateBrandDto.package,
      );

      if (!packageObj) {
        throw new NotFoundException(
          `Package with ID ${updateBrandDto.package} not found`,
        );
      }
    }

    const effectiveCountry = updateBrandDto.country ?? brand.country;

    if (updateBrandDto.mainContact) {
      await this.validateMainContact(
        updateBrandDto.mainContact,
        effectiveCountry,
      );
    }

    Object.assign(brand, updateBrandDto);
    return brand.save();
  }

  async updateForUser(
    id: string,
    updateBrandDto: UpdateBrandDto,
    user: User,
  ): Promise<Brand> {
    const brand = await this.brandModel.findOne({
      _id: id,
      isArchived: false,
    });
    if (!brand) throw new NotFoundException('Brand not found');

    if (user.role === UserRole.SUBADMIN) {
      if (!user.countries?.includes(brand.country)) {
        throw new ForbiddenException(
          'You do not have access to this brand (country mismatch)',
        );
      }
    }

    if (user.role === UserRole.BRAND_MANAGER) {
      if (!user.brands.includes(brand._id)) {
        throw new ForbiddenException('You do not have access to this brand');
      }
    }

    const effectiveCountry = updateBrandDto.country ?? brand.country;

    if (updateBrandDto.mainContact) {
      await this.validateMainContact(
        updateBrandDto.mainContact,
        effectiveCountry,
      );
    }

    Object.assign(brand, updateBrandDto);
    return brand.save();
  }

  async archive(id: string): Promise<Brand> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid brand ID');
    }

    const brand = await this.brandModel.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true },
    );

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  async restore(id: string): Promise<Brand> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid brand ID');
    }

    const brand = await this.brandModel.findByIdAndUpdate(
      id,
      { isArchived: false },
      { new: true },
    );

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  async remove(id: string): Promise<void> {
    const brand = await this.brandModel.findByIdAndDelete(id);
    if (!brand) throw new NotFoundException('Brand not found');
  }

  private async validateMainContact(
    mainContactId: string,
    brandCountry: Country,
  ) {
    if (!mongoose.Types.ObjectId.isValid(mainContactId)) {
      throw new BadRequestException('Main contact ID is not valid');
    }

    const user = await this.userModel.findById(mainContactId);

    if (!user) {
      throw new NotFoundException('Main contact user not found');
    }

    if (!user.countries?.includes(brandCountry)) {
      throw new BadRequestException(
        'Main contact must have the brand country assigned',
      );
    }
  }
}

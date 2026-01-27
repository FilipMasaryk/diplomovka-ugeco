import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Brand } from './schemas/brandSchema';
import { Package, PackageType } from 'src/packages/schemas/packageSchema';
import { User, UserDocument } from 'src/users/schemas/userSchema';
import mongoose, { Model, Types } from 'mongoose';
import { CreateBrandDto } from './schemas/createBrandSchema';
import { UpdateBrandDto } from './schemas/updateBrandSchema';
import { Country } from 'src/common/enums/countryEnum';
import { UserRole } from 'src/common/enums/userRoleEnum';
import path from 'path';
import fs from 'fs';

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

    let packageObjectId: Types.ObjectId | undefined;
    let purchasedAt: Date | undefined;
    let offersCount = 0;

    if (packageId) {
      if (!mongoose.Types.ObjectId.isValid(packageId)) {
        throw new BadRequestException('Package ID is not a valid ObjectId');
      }

      const packageObj = await this.packageModel.findById(packageId);

      if (!packageObj) {
        throw new NotFoundException(`Package with ID ${packageId} not found`);
      }

      if (packageObj.type !== PackageType.BRAND) {
        throw new BadRequestException(
          'You can only assign a package of type "brand" to a brand',
        );
      }

      packageObjectId = packageObj._id;
      purchasedAt = new Date();

      offersCount = packageObj.offersCount;
    }

    if (user.role === UserRole.SUBADMIN) {
      const allowedCountries = user.countries ?? [];

      if (!allowedCountries.includes(country)) {
        throw new ForbiddenException(
          `Subadmin cannot assign country "${country}". Allowed: ${allowedCountries.join(', ')}`,
        );
      }
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
      package: packageObjectId,
      purchasedAt,
      offersCount,
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

  async findByCountries(countries: Country[]): Promise<Brand[]> {
    if (!countries || countries.length === 0) {
      return [];
    }

    return this.brandModel
      .find({
        country: { $in: countries },
        isArchived: false,
      })
      .exec();
  }

  async findOneForUser(id: string, user: User): Promise<Brand> {
    const brand = await this.brandModel.findOne({
      _id: id,
      isArchived: false,
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    if (user.role === UserRole.ADMIN) {
      return brand;
    }

    if (user.role === UserRole.SUBADMIN) {
      const allowedCountries = user.countries ?? [];
      if (!allowedCountries.includes(brand.country)) {
        throw new ForbiddenException(
          'You do not have access to this brand (country restriction)',
        );
      }
      return brand;
    }

    if (user.role === UserRole.BRAND_MANAGER) {
      const brandIds = user.brands.map((b) => b.toString());
      if (!brandIds.includes(brand._id.toString())) {
        throw new ForbiddenException('You do not have access to this brand');
      }
      return brand;
    }

    throw new ForbiddenException('You do not have access to this brand');
  }

  async update(
    id: string,
    updateBrandDto: UpdateBrandDto,
    user: User,
  ): Promise<Brand> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Brand ID is not a valid ObjectId');
    }

    const brand = await this.brandModel.findById(id);
    if (!brand) throw new NotFoundException('Brand not found');

    let packageObjectId: Types.ObjectId | undefined;
    let purchasedAt: Date | undefined;
    let offersCount = brand.offersCount;

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

      if (packageObj.type !== PackageType.BRAND) {
        throw new BadRequestException(
          'You can only assign a package of type "brand" to a brand',
        );
      }

      packageObjectId = packageObj._id;
      purchasedAt = new Date();
      offersCount = packageObj.offersCount;
    } else if (updateBrandDto.package === null) {
      packageObjectId = undefined;
      purchasedAt = undefined;
      offersCount = 0;
    } else {
      packageObjectId = brand.package;
      purchasedAt = brand.purchasedAt;
      offersCount = brand.offersCount;
    }

    const effectiveCountry = updateBrandDto.country ?? brand.country;

    if (user.role === UserRole.SUBADMIN) {
      const allowedCountries = user.countries ?? [];
      if (!allowedCountries.includes(effectiveCountry)) {
        throw new ForbiddenException(
          `Subadmin cannot set brand country to "${effectiveCountry}". Allowed countries: ${allowedCountries.join(
            ', ',
          )}`,
        );
      }
    }

    if (updateBrandDto.mainContact) {
      await this.validateMainContact(
        updateBrandDto.mainContact,
        effectiveCountry,
      );
    }

    Object.assign(brand, {
      ...updateBrandDto,
      package: packageObjectId,
      purchasedAt,
      offersCount,
    });

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

    if (
      !user.brands?.map((id) => id.toString()).includes(brand._id.toString())
    ) {
      throw new ForbiddenException('You do not have access to this brand');
    }

    if (updateBrandDto.country) {
      throw new ForbiddenException(
        'You are not allowed to change brand country',
      );
    }

    if (updateBrandDto.package) {
      throw new ForbiddenException(
        'You are not allowed to change brand package',
      );
    }

    if (updateBrandDto.mainContact) {
      await this.validateMainContact(updateBrandDto.mainContact, brand.country);
    }
    //mazanie stareho loga ak je nove logo
    if (updateBrandDto.logo && brand.logo) {
      try {
        const oldPath = path.join(
          process.cwd(),
          'src',
          updateBrandDto.logo.includes('brandLogos')
            ? 'uploads/brandLogos'
            : '',
          path.basename(brand.logo),
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (err) {
        console.warn('Failed to delete old logo:', err);
      }
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

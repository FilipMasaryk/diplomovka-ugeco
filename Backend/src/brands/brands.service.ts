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
    if (!mongoose.Types.ObjectId.isValid(createBrandDto.package)) {
      throw new BadRequestException('Package ID is not a valid ObjectId');
    }

    const packageObj = await this.packageModel.findById(createBrandDto.package);

    if (!packageObj) {
      throw new NotFoundException(
        `Package with ID ${createBrandDto.package} not found`,
      );
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

    const brand = await this.brandModel.findByIdAndUpdate(id, updateBrandDto, {
      new: true,
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
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

    if (!user.brands.includes(brand._id)) {
      throw new ForbiddenException(
        'You do not have access to update this brand',
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
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePackageDto } from './schemas/create-package.dto';
import { UpdatePackageDto } from './schemas/update-package.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Package } from './schemas/packageSchema';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/userSchema';

@Injectable()
export class PackagesService {
  constructor(
    @InjectModel(Package.name)
    private readonly packageModel: Model<Package>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(createPackageDto: CreatePackageDto) {
    const exists = await this.packageModel.findOne({
      name: createPackageDto.name,
    });
    if (exists) {
      throw new BadRequestException('Package with this name already exists');
    }

    const created = new this.packageModel(createPackageDto);
    return created.save();
  }

  async findAll() {
    return this.packageModel.find();
  }

  async findOne(id: string) {
    const pkg = await this.packageModel.findById(id);
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }
    return pkg;
  }

  async update(id: string, dto: UpdatePackageDto) {
    const pkg = await this.packageModel.findById(id);
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    Object.assign(pkg, dto);
    return pkg.save();
  }

  async remove(id: string) {
    const deletedPackage = await this.packageModel.findByIdAndDelete(id);
    if (!deletedPackage) {
      throw new NotFoundException('Package not found');
    }

    await this.userModel.updateMany(
      { package: id },
      { $unset: { package: '' } },
    );

    return { message: 'Package deleted and removed from users' };
  }
}

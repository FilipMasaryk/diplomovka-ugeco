import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePackageDto } from './schemas/createPackageDto';
import { UpdatePackageDto } from './schemas/updatePackageDto';
import { InjectModel } from '@nestjs/mongoose';
import { Package } from './schemas/packageSchema';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/userSchema';
import { Brand } from 'src/brands/schemas/brandSchema';

@Injectable()
export class PackagesService {
  constructor(
    @InjectModel(Package.name)
    private readonly packageModel: Model<Package>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Brand.name)
    private readonly brandModel: Model<Brand>,
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

  async findAll(archived = false) {
    if (archived) {
      return this.packageModel.find({ isArchived: true });
    }
    return this.packageModel.find({ $or: [{ isArchived: false }, { isArchived: { $exists: false } }] });
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

  async archive(id: string) {
    const pkg = await this.packageModel.findById(id);
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    if (pkg.isArchived) {
      throw new BadRequestException('Package is already archived');
    }

    const usersWithPackage = await this.userModel.find({ package: pkg._id, isArchived: { $ne: true } });
    const brandsWithPackage = await this.brandModel.find({ package: pkg._id, isArchived: { $ne: true } });

    if (usersWithPackage.length > 0 || brandsWithPackage.length > 0) {
      throw new BadRequestException(
        'Package cannot be archived because it is assigned to users or brands.',
      );
    }

    pkg.isArchived = true;
    await pkg.save();
    return { message: 'Package archived' };
  }

  async restore(id: string) {
    const pkg = await this.packageModel.findById(id);
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    if (!pkg.isArchived) {
      throw new BadRequestException('Package is not archived');
    }

    pkg.isArchived = false;
    await pkg.save();
    return { message: 'Package restored' };
  }

  async remove(id: string) {
    const pkg = await this.packageModel.findById(id);
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    // Skontroluje, či je balíček priradený k nejakým používateľom
    const usersWithPackage = await this.userModel
      .find({ package: id })
      .select('email');
    if (usersWithPackage.length > 0) {
      const emails = usersWithPackage.map((u) => u.email).join(', ');
      throw new BadRequestException(
        `Package is assigned to users: ${emails}. Remove package from users before deletion.`,
      );
    }

    await this.packageModel.findByIdAndDelete(id);

    await this.brandModel.updateMany(
      { package: id },
      { $unset: { package: '' } },
    );

    return { message: 'Package deleted and removed from brands' };
  }
}

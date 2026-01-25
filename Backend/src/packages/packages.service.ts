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

    // Odstráni balíček zo všetkých značiek, ktoré ho mali priradený
    await this.brandModel.updateMany(
      { package: id },
      { $unset: { package: '' } },
    );

    return { message: 'Package deleted and removed from brands' };
  }
}

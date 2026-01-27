import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Offer, OfferDocument } from './schemas/offerSchema';
import { Brand } from '../brands/schemas/brandSchema';
import { User } from '../users/schemas/userSchema';
import { CreateOfferDto } from './schemas/createOfferDto';
import { UserRole } from 'src/common/enums/userRoleEnum';
import { UpdateOfferDto } from './schemas/updateOfferDto';
import * as fs from 'fs';
import path from 'path';
import { Package, PackageDocument } from 'src/packages/schemas/packageSchema';

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,

    @InjectModel(Brand.name)
    private readonly brandModel: Model<Brand>,

    @InjectModel(Package.name)
    private readonly packageModel: Model<Package>,
  ) {}

  async create(createOfferDto: CreateOfferDto, user: User): Promise<Offer> {
    const brand = await this.brandModel
      .findById(createOfferDto.brand)
      .populate('package');
    if (!brand || brand.isArchived) {
      throw new NotFoundException('Brand not found');
    }

    if (
      user.role === UserRole.SUBADMIN &&
      !user.countries?.includes(brand.country)
    ) {
      throw new ForbiddenException(
        'You cannot create offers for this brand (country mismatch)',
      );
    }

    if (
      user.role === UserRole.BRAND_MANAGER &&
      !user.brands?.includes(brand._id)
    ) {
      throw new ForbiddenException('You cannot create offers for this brand');
    }

    if (brand.package) {
      const pkg = brand.package as unknown as PackageDocument;

      if (brand.purchasedAt) {
        const expiresAt = new Date(brand.purchasedAt);
        expiresAt.setMonth(expiresAt.getMonth() + pkg.validityMonths);

        if (expiresAt < new Date()) {
          throw new BadRequestException('Brand package has expired');
        }
      }
    }

    if (brand.offersCount <= 0) {
      throw new BadRequestException('Brand does not have remaining offers');
    }

    const offer = await this.offerModel.create({
      ...createOfferDto,
      brand: brand._id,
    });

    await this.brandModel.findByIdAndUpdate(brand._id, {
      $inc: { offersCount: -1 },
      $push: { offers: offer._id },
    });

    return offer;
  }

  async findAll(): Promise<Offer[]> {
    return this.offerModel.find({ isArchived: false }).populate('brand').exec();
  }

  async findAllForUser(user: User): Promise<Offer[]> {
    if (user.role === UserRole.ADMIN) {
      return this.findAll();
    }

    if (user.role === UserRole.SUBADMIN) {
      const allowedBrandIds = await this.brandModel.find({
        country: { $in: user.countries },
        isArchived: false,
      });

      return this.offerModel.find({
        brand: { $in: allowedBrandIds },
        isArchived: false,
      });
    }

    if (user.role === UserRole.BRAND_MANAGER) {
      return this.offerModel.find({
        brand: { $in: user.brands },
        isArchived: false,
      });
    }

    return [];
  }

  async findOne(id: string, user: User): Promise<Offer> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerModel.findById(id);
    if (!offer || offer.isArchived) {
      throw new NotFoundException('Offer not found');
    }

    const brand = await this.brandModel.findById(offer.brand);
    if (!brand || brand.isArchived) {
      throw new NotFoundException('Brand not found');
    }

    if (user.role === UserRole.SUBADMIN) {
      if (!user.countries?.includes(brand.country)) {
        throw new ForbiddenException(
          'You cannot access offers for this brand (country mismatch)',
        );
      }
    }

    if (user.role === UserRole.BRAND_MANAGER) {
      if (!user.brands?.some((b) => b.toString() === brand._id.toString())) {
        throw new ForbiddenException('You cannot access offers for this brand');
      }
    }

    return offer;
  }

  async update(
    id: string,
    updateOfferDto: UpdateOfferDto,
    user: User,
  ): Promise<Offer> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerModel.findById(id);
    if (!offer || offer.isArchived) {
      throw new NotFoundException('Offer not found');
    }

    const brand = await this.brandModel.findById(offer.brand);
    if (!brand || brand.isArchived) {
      throw new NotFoundException('Brand not found');
    }
    if (updateOfferDto.image && offer.image) {
      const oldPath = path.join(
        process.cwd(),
        'src',
        offer.image.replace('/uploads/', 'uploads/'),
      );

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    Object.assign(offer, updateOfferDto);
    return offer.save();
  }

  async archive(id: string, user: User): Promise<Offer> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerModel.findById(id);
    if (!offer || offer.isArchived) {
      throw new NotFoundException('Offer not found');
    }

    const brand = await this.brandModel.findById(offer.brand);
    if (!brand || brand.isArchived) {
      throw new NotFoundException('Brand not found');
    }

    if (user.role === UserRole.SUBADMIN) {
      if (!user.countries?.includes(brand.country)) {
        throw new ForbiddenException(
          'You cannot archive offers for this brand (country mismatch)',
        );
      }
    }

    if (user.role === UserRole.BRAND_MANAGER) {
      if (!user.brands?.some((b) => b.toString() === brand._id.toString())) {
        throw new ForbiddenException(
          'You cannot archive offers for this brand',
        );
      }
    }

    offer.isArchived = true;
    return offer.save();
  }

  async restore(id: string, user: User): Promise<Offer> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerModel.findById(id);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const brand = await this.brandModel.findById(offer.brand);
    if (!brand || brand.isArchived) {
      throw new NotFoundException('Brand not found');
    }

    if (user.role === UserRole.SUBADMIN) {
      if (!user.countries?.includes(brand.country)) {
        throw new ForbiddenException(
          'You cannot restore offers for this brand (country mismatch)',
        );
      }
    }

    if (user.role === UserRole.BRAND_MANAGER) {
      if (!user.brands?.some((b) => b.toString() === brand._id.toString())) {
        throw new ForbiddenException(
          'You cannot restore offers for this brand',
        );
      }
    }

    offer.isArchived = false;
    return offer.save();
  }
}

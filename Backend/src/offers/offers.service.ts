import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Offer, OfferDocument, OfferStatus } from './schemas/offerSchema';
import { Brand } from '../brands/schemas/brandSchema';
import { User, UserDocument } from '../users/schemas/userSchema';
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

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
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

    const isConcept = createOfferDto.status === OfferStatus.CONCEPT;

    if (!isConcept) {
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
    }

    const offer = await this.offerModel.create({
      ...createOfferDto,
      brand: brand._id,
    });

    if (!isConcept) {
      await this.brandModel.findByIdAndUpdate(brand._id, {
        $inc: { offersCount: -1 },
        $push: { offers: offer._id },
      });
    }

    return offer;
  }

  async findAll(archived = false): Promise<Offer[]> {
    return this.offerModel.find({ isArchived: archived }).populate('brand').exec();
  }

  async findAllForUser(user: User, archived = false): Promise<Offer[]> {
    if (user.role === UserRole.ADMIN) {
      return this.findAll(archived);
    }

    if (user.role === UserRole.SUBADMIN) {
      const allowedBrandIds = await this.brandModel.find({
        country: { $in: user.countries },
        isArchived: false,
      });

      return this.offerModel.find({
        brand: { $in: allowedBrandIds },
        isArchived: archived,
      }).populate('brand').exec();
    }

    if (user.role === UserRole.BRAND_MANAGER) {
      return this.offerModel.find({
        brand: { $in: user.brands },
        isArchived: archived,
      }).populate('brand').exec();
    }

    return [];
  }

  async findOne(id: string, user: User): Promise<Offer> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerModel.findById(id).populate('brand').exec();
    if (!offer || offer.isArchived) {
      throw new NotFoundException('Offer not found');
    }

    const brand = await this.brandModel.findById(offer.brand);
    if (!brand || brand.isArchived) {
      throw new NotFoundException('Brand not found');
    }

    if (user.role === UserRole.SUBADMIN || user.role === UserRole.CREATOR) {
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

    if (
      user.role === UserRole.SUBADMIN &&
      !user.countries?.includes(brand.country)
    ) {
      throw new ForbiddenException(
        'You cannot update offers for this brand (country mismatch)',
      );
    }

    if (
      user.role === UserRole.BRAND_MANAGER &&
      !user.brands?.includes(brand._id)
    ) {
      throw new ForbiddenException('You cannot update offers for this brand');
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

    // When publishing a concept, deduct offersCount from brand
    const isPublishing =
      offer.status === OfferStatus.CONCEPT &&
      updateOfferDto.status === OfferStatus.ACTIVE;

    if (isPublishing) {
      if (brand.offersCount <= 0) {
        throw new BadRequestException('Brand does not have remaining offers');
      }
      await this.brandModel.findByIdAndUpdate(brand._id, {
        $inc: { offersCount: -1 },
        $push: { offers: offer._id },
      });
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

    const updated = await this.offerModel.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Offer not found');
    return updated;
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

    const updated = await this.offerModel.findByIdAndUpdate(
      id,
      { isArchived: false },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Offer not found');
    return updated;
  }

  async remove(id: string, user: User): Promise<{ deleted: boolean }> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerModel.findById(id);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.status !== OfferStatus.CONCEPT) {
      throw new BadRequestException(
        'Only concept offers can be deleted. Archive active offers instead.',
      );
    }

    const brand = await this.brandModel.findById(offer.brand);
    if (brand) {
      if (
        user.role === UserRole.SUBADMIN &&
        !user.countries?.includes(brand.country)
      ) {
        throw new ForbiddenException(
          'You cannot delete offers for this brand (country mismatch)',
        );
      }

      if (
        user.role === UserRole.BRAND_MANAGER &&
        !user.brands?.some((b) => b.toString() === brand._id.toString())
      ) {
        throw new ForbiddenException('You cannot delete offers for this brand');
      }
    }

    await this.offerModel.findByIdAndDelete(id);
    return { deleted: true };
  }

  async findAllForCreator(
    user: User,
    filters: {
      category?: string;
      targets?: string[];
      paidCooperation?: boolean;
      languages?: string[];
    },
  ): Promise<Offer[]> {
    const allowedBrands = await this.brandModel
      .find({ country: { $in: user.countries }, isArchived: false })
      .select('_id');

    const brandIds = allowedBrands.map((b) => b._id);

    const findQuery: any = {
      brand: { $in: brandIds },
      isArchived: false,
    };

    if (filters.category) {
      findQuery.categories = { $in: [filters.category] };
    }

    if (filters.targets && filters.targets.length > 0) {
      findQuery.targets = { $in: filters.targets };
    }

    if (filters.paidCooperation !== undefined) {
      findQuery.paidCooperation = filters.paidCooperation;
    }

    if (filters.languages && filters.languages.length > 0) {
      findQuery.languages = { $in: filters.languages };
    }

    return this.offerModel.find(findQuery).populate('brand').exec();
  }

  async getStats() {
    const now = new Date();

    const [totalOffers, activeOffers, creatorsCount] = await Promise.all([
      this.offerModel.countDocuments(),

      this.offerModel.countDocuments({
        activeFrom: { $lte: now },
        activeTo: { $gte: now },
        isArchived: false,
      }),

      this.userModel.countDocuments({
        role: UserRole.CREATOR,
      }),
    ]);

    return {
      totalOffers,
      activeOffers,
      creatorsCount,
    };
  }
}

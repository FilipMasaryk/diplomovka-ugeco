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
import { Country } from 'src/common/enums/countryEnum';
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

  private async getFreshBrandIds(user: User): Promise<string[]> {
    const userId = (user as any)._id ?? (user as any).id;
    const freshUser = await this.userModel.findById(userId).lean();
    return (freshUser?.brands || []).map((b) => b.toString());
  }

  private async getFreshCountries(user: User): Promise<string[]> {
    const userId = (user as any)._id ?? (user as any).id;
    const freshUser = await this.userModel.findById(userId).lean();
    return freshUser?.countries || [];
  }

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

    if (user.role === UserRole.BRAND_MANAGER) {
      const freshBrandIds = await this.getFreshBrandIds(user);
      if (!freshBrandIds.includes(brand._id.toString())) {
        throw new ForbiddenException('You cannot create offers for this brand');
      }
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

      if (!brand.offersCount || brand.offersCount <= 0) {
        throw new BadRequestException('Brand does not have remaining offers');
      }
    }

    const offer = await this.offerModel.create({
      ...createOfferDto,
      brand: brand._id,
    });

    if (!isConcept) {
      await this.brandModel.findByIdAndUpdate(brand._id, {
        $inc: { offersCount: -1, totalOffersMade: 1 },
        $push: { offers: offer._id },
      });
    }

    return offer;
  }

  async findAll(archived = false): Promise<Offer[]> {
    return this.offerModel
      .find({ isArchived: archived })
      .populate('brand')
      .exec();
  }

  async findAllForUser(user: User, archived = false): Promise<Offer[]> {
    if (user.role === UserRole.ADMIN) {
      return this.findAll(archived);
    }

    if (user.role === UserRole.SUBADMIN) {
      const allowedBrands = await this.brandModel.find({
        country: { $in: user.countries },
        isArchived: false,
      });
      const allowedBrandIds = allowedBrands.map((b) => b._id);

      return this.offerModel
        .find({
          brand: { $in: allowedBrandIds },
          isArchived: archived,
        })
        .populate('brand')
        .exec();
    }

    if (user.role === UserRole.BRAND_MANAGER) {
      const freshBrandIds = await this.getFreshBrandIds(user);
      const brandObjectIds = freshBrandIds.map(
        (b) => new mongoose.Types.ObjectId(b),
      );
      return this.offerModel
        .find({
          brand: { $in: brandObjectIds },
          isArchived: archived,
        })
        .populate('brand')
        .exec();
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
      const countries = await this.getFreshCountries(user);
      if (!countries.includes(brand.country)) {
        throw new ForbiddenException(
          'You cannot access offers for this brand (country mismatch)',
        );
      }
    }

    if (user.role === UserRole.BRAND_MANAGER) {
      const freshBrandIds = await this.getFreshBrandIds(user);
      if (!freshBrandIds.includes(brand._id.toString())) {
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

    if (user.role === UserRole.BRAND_MANAGER) {
      const freshBrandIds = await this.getFreshBrandIds(user);
      if (!freshBrandIds.includes(brand._id.toString())) {
        throw new ForbiddenException('You cannot update offers for this brand');
      }
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

    const isPublishing =
      offer.status === OfferStatus.CONCEPT &&
      updateOfferDto.status === OfferStatus.ACTIVE;

    if (isPublishing) {
      if (!brand.offersCount || brand.offersCount <= 0) {
        throw new BadRequestException('Brand does not have remaining offers');
      }

      await this.brandModel.findByIdAndUpdate(brand._id, {
        $addToSet: { offers: offer._id },
        $inc: { offersCount: -1, totalOffersMade: 1 },
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
      const freshBrandIds = await this.getFreshBrandIds(user);
      if (!freshBrandIds.includes(brand._id.toString())) {
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
      const freshBrandIds = await this.getFreshBrandIds(user);
      if (!freshBrandIds.includes(brand._id.toString())) {
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

      if (user.role === UserRole.BRAND_MANAGER) {
        const freshBrandIds = await this.getFreshBrandIds(user);
        if (!freshBrandIds.includes(brand._id.toString())) {
          throw new ForbiddenException(
            'You cannot delete offers for this brand',
          );
        }
      }
    }

    await this.offerModel.findByIdAndDelete(id);
    return { deleted: true };
  }

  async getLikedOfferIds(user: User): Promise<string[]> {
    const userId = (user as any)._id ?? (user as any).id;
    const freshUser = await this.userModel.findById(userId).lean();
    return (freshUser?.likedOffers || []).map((id) => id.toString());
  }

  async toggleLike(offerId: string, user: User): Promise<{ liked: boolean }> {
    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerModel.findById(offerId);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const userId = (user as any)._id ?? (user as any).id;
    const freshUser = await this.userModel.findById(userId);
    if (!freshUser) {
      throw new NotFoundException('User not found');
    }

    const alreadyLiked = freshUser.likedOffers.some(
      (id) => id.toString() === offerId,
    );

    if (alreadyLiked) {
      await this.userModel.findByIdAndUpdate(userId, {
        $pull: { likedOffers: new mongoose.Types.ObjectId(offerId) },
      });
      return { liked: false };
    } else {
      await this.userModel.findByIdAndUpdate(userId, {
        $addToSet: { likedOffers: new mongoose.Types.ObjectId(offerId) },
      });
      return { liked: true };
    }
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
    const countries = await this.getFreshCountries(user);
    const allowedBrands = await this.brandModel
      .find({ country: { $in: countries }, isArchived: false })
      .select('_id');

    const brandIds = allowedBrands.map((b) => b._id);

    const now = new Date();
    const findQuery: any = {
      brand: { $in: brandIds },
      isArchived: false,
      status: 'active',
      activeFrom: { $lte: now },
      activeTo: { $gte: now },
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

    return this.offerModel
      .find(findQuery)
      .populate('brand')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getStats(countries?: string[]) {
    const now = new Date();

    let brandFilter: Record<string, unknown> | undefined;
    if (countries?.length) {
      const brandIds = await this.brandModel
        .find({ country: { $in: countries } })
        .distinct('_id');
      brandFilter = { brand: { $in: brandIds } };
    }

    const offerQuery = { ...brandFilter, isArchived: false };
    const activeOfferQuery = {
      ...offerQuery,
      activeFrom: { $lte: now },
      activeTo: { $gte: now },
    };

    const creatorQuery: Record<string, unknown> = {
      role: UserRole.CREATOR,
    };
    if (countries?.length) {
      creatorQuery.countries = { $in: countries };
    }

    const [totalOffers, activeOffers, creatorsCount] = await Promise.all([
      this.offerModel.countDocuments(offerQuery),
      this.offerModel.countDocuments(activeOfferQuery),
      this.userModel.countDocuments(creatorQuery),
    ]);

    return {
      totalOffers,
      activeOffers,
      creatorsCount,
      countriesCount: countries?.length || Object.keys(Country).length,
    };
  }

  async getMonthlyStats(months = 7, countries?: string[]) {
    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - months + 1,
      1,
    );

    const monthBuckets: string[] = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      monthBuckets.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      );
    }

    const creatorMatch: Record<string, unknown> = {
      role: UserRole.CREATOR,
      createdAt: { $gte: startDate },
    };
    if (countries?.length) {
      creatorMatch.countries = { $in: countries };
    }

    const offerMatch: Record<string, unknown> = {
      createdAt: { $gte: startDate },
    };
    if (countries?.length) {
      const brandIds = await this.brandModel
        .find({ country: { $in: countries } })
        .distinct('_id');
      offerMatch.brand = { $in: brandIds };
    }

    const [creatorsAgg, offersAgg] = await Promise.all([
      this.userModel.aggregate([
        { $match: creatorMatch },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
      ]),
      this.offerModel.aggregate([
        { $match: offerMatch },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const creatorsMap = new Map(creatorsAgg.map((r) => [r._id, r.count]));
    const offersMap = new Map(offersAgg.map((r) => [r._id, r.count]));

    return {
      creatorsMonthly: monthBuckets.map((m) => ({
        month: m,
        count: creatorsMap.get(m) || 0,
      })),
      offersMonthly: monthBuckets.map((m) => ({
        month: m,
        count: offersMap.get(m) || 0,
      })),
    };
  }
}

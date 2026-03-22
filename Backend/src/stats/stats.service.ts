import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/userSchema';
import { Brand } from 'src/brands/schemas/brandSchema';
import {
  Offer,
  OfferDocument,
  OfferStatus,
} from 'src/offers/schemas/offerSchema';
import { UserRole } from 'src/common/enums/userRoleEnum';
import { Country } from 'src/common/enums/countryEnum';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Brand.name)
    private readonly brandModel: Model<Brand>,
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
  ) {}

  async getOverview(countries?: string[]) {
    const now = new Date();

    // Brand filter for subadmin country restriction
    let brandIds: any[] | undefined;
    if (countries?.length) {
      brandIds = await this.brandModel
        .find({ country: { $in: countries } })
        .distinct('_id');
    }

    const userQuery: Record<string, unknown> = { isArchived: false };
    const creatorQuery: Record<string, unknown> = {
      role: UserRole.CREATOR,
      isArchived: false,
    };
    const brandQuery: Record<string, unknown> = { isArchived: false };
    const offerQuery: Record<string, unknown> = { isArchived: false };
    const activeOfferQuery: Record<string, unknown> = {
      isArchived: false,
      status: OfferStatus.ACTIVE,
      activeFrom: { $lte: now },
      activeTo: { $gte: now },
    };
    const archivedQuery: Record<string, unknown> = { isArchived: true };

    if (countries?.length) {
      userQuery.countries = { $in: countries };
      creatorQuery.countries = { $in: countries };
      brandQuery.country = { $in: countries };
      offerQuery.brand = { $in: brandIds };
      activeOfferQuery.brand = { $in: brandIds };
      archivedQuery.countries = { $in: countries };
    }

    // Users/brands with a package assigned
    const userWithPackageQuery: Record<string, unknown> = {
      isArchived: false,
      package: { $ne: null },
    };
    const brandWithPackageQuery: Record<string, unknown> = {
      isArchived: false,
      package: { $ne: null },
    };
    if (countries?.length) {
      userWithPackageQuery.countries = { $in: countries };
      brandWithPackageQuery.country = { $in: countries };
    }

    const [
      totalUsers,
      creatorsCount,
      brandsCount,
      totalOffers,
      activeOffers,
      archivedUsers,
      usersWithPackage,
      brandsWithPackage,
    ] = await Promise.all([
      this.userModel.countDocuments(userQuery),
      this.userModel.countDocuments(creatorQuery),
      this.brandModel.countDocuments(brandQuery),
      this.offerModel.countDocuments(offerQuery),
      this.offerModel.countDocuments(activeOfferQuery),
      this.userModel.countDocuments(archivedQuery),
      this.userModel.countDocuments(userWithPackageQuery),
      this.brandModel.countDocuments(brandWithPackageQuery),
    ]);

    const countriesCount = countries?.length || Object.keys(Country).length;

    return {
      totalUsers,
      creatorsCount,
      brandsCount,
      totalOffers,
      activeOffers,
      countriesCount,
      archivedUsers,
      assignedPackages: usersWithPackage + brandsWithPackage,
    };
  }

  async getMonthlyOverview(months = 7, countries?: string[]) {
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

    // Build match filters
    const userMatch: Record<string, unknown> = {
      createdAt: { $gte: startDate },
      isArchived: false,
    };
    const creatorMatch: Record<string, unknown> = {
      role: UserRole.CREATOR,
      createdAt: { $gte: startDate },
      isArchived: false,
    };
    const offerMatch: Record<string, unknown> = {
      createdAt: { $gte: startDate },
    };

    if (countries?.length) {
      userMatch.countries = { $in: countries };
      creatorMatch.countries = { $in: countries };
      const brandIds = await this.brandModel
        .find({ country: { $in: countries } })
        .distinct('_id');
      offerMatch.brand = { $in: brandIds };
    }

    const groupByMonth = {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    };

    const [usersAgg, creatorsAgg, offersAgg] = await Promise.all([
      this.userModel.aggregate([{ $match: userMatch }, groupByMonth]),
      this.userModel.aggregate([{ $match: creatorMatch }, groupByMonth]),
      this.offerModel.aggregate([{ $match: offerMatch }, groupByMonth]),
    ]);

    const usersMap = new Map(usersAgg.map((r) => [r._id, r.count]));
    const creatorsMap = new Map(creatorsAgg.map((r) => [r._id, r.count]));
    const offersMap = new Map(offersAgg.map((r) => [r._id, r.count]));

    return {
      usersMonthly: monthBuckets.map((m) => ({
        month: m,
        count: usersMap.get(m) || 0,
      })),
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

  async getRoleDistribution(countries?: string[]) {
    const match: Record<string, unknown> = { isArchived: false };
    if (countries?.length) {
      match.countries = { $in: countries };
    }

    const result = await this.userModel.aggregate([
      { $match: match },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    return result.map((r) => ({ role: r._id, count: r.count }));
  }

  async getCategoryDistribution(countries?: string[]) {
    const match: Record<string, unknown> = { isArchived: false };
    if (countries?.length) {
      const brandIds = await this.brandModel
        .find({ country: { $in: countries } })
        .distinct('_id');
      match.brand = { $in: brandIds };
    }

    const result = await this.offerModel.aggregate([
      { $match: match },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return result.map((r) => ({ category: r._id, count: r.count }));
  }

  async getCountryDistribution(countries?: string[]) {
    const match: Record<string, unknown> = { isArchived: false };
    if (countries?.length) {
      match.country = { $in: countries };
    }

    const result = await this.brandModel.aggregate([
      { $match: match },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return result.map((r) => ({ country: r._id, count: r.count }));
  }
}

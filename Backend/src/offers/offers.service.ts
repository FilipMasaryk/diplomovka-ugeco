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

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,

    @InjectModel(Brand.name)
    private readonly brandModel: Model<Brand>,
  ) {}

  async create(createOfferDto: CreateOfferDto, user: User): Promise<Offer> {
    if (!mongoose.Types.ObjectId.isValid(createOfferDto.brand)) {
      throw new BadRequestException('Invalid brand ID');
    }

    const brand = await this.brandModel.findOne({
      _id: createOfferDto.brand,
      isArchived: false,
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    if (
      user.role !== UserRole.ADMIN &&
      !user.brands?.map((b) => b.toString()).includes(brand._id.toString())
    ) {
      throw new ForbiddenException('You do not have access to this brand');
    }

    const offer = new this.offerModel({
      ...createOfferDto,
      brand: brand._id,
    });

    return offer.save();
  }

  async findAll(): Promise<Offer[]> {
    return this.offerModel.find({ isArchived: false }).populate('brand').exec();
  }

  async findAllForUser(user: User): Promise<Offer[]> {
    if (user.role === UserRole.ADMIN) {
      return this.findAll();
    }

    return this.offerModel.find({
      brand: { $in: user.brands },
      isArchived: false,
    });
  }

  async findOne(id: string, user: User): Promise<Offer> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerModel.findById(id).populate('brand');

    if (!offer || offer.isArchived) {
      throw new NotFoundException('Offer not found');
    }

    if (
      user.role !== UserRole.ADMIN &&
      !user.brands?.map((b) => b.toString()).includes(offer.brand.toString())
    ) {
      throw new ForbiddenException('You do not have access to this offer');
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

    if (
      user.role !== UserRole.ADMIN &&
      !user.brands?.map((b) => b.toString()).includes(offer.brand.toString())
    ) {
      throw new ForbiddenException(
        'You do not have access to update this offer',
      );
    }

    Object.assign(offer, updateOfferDto);
    return offer.save();
  }

  async archive(id: string): Promise<Offer> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerModel.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true },
    );

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }

  async restore(id: string): Promise<Offer> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerModel.findByIdAndUpdate(
      id,
      { isArchived: false },
      { new: true },
    );

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }
}

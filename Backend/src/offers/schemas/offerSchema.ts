// src/offers/schemas/offerSchema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { OfferTarget } from '../../common/enums/offerTargetEnum';
import { BrandCategory } from 'src/common/enums/brandCategoriesEnum';
import { Country } from 'src/common/enums/countryEnum';

export type OfferDocument = Offer & Document;

@Schema({ timestamps: true })
export class Offer {
  @Prop({ required: true })
  paidCooperation: boolean;

  @Prop({ required: true })
  name: string;

  @Prop({
    type: [String],
    enum: BrandCategory,
    required: true,
  })
  categories: BrandCategory[];

  @Prop({ required: true })
  activeFrom: Date;

  @Prop({ required: true })
  activeTo: Date;

  @Prop({ required: true })
  image: string;

  @Prop({
    type: [String],
    enum: Country,
    required: true,
  })
  languages: Country[];

  @Prop({
    type: [String],
    enum: OfferTarget,
    required: true,
  })
  targets: OfferTarget[];

  @Prop({ required: true })
  description: string;

  @Prop()
  website?: string;

  @Prop()
  facebook?: string;

  @Prop()
  instagram?: string;

  @Prop()
  tiktok?: string;

  @Prop()
  pinterest?: string;

  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true })
  brand: Types.ObjectId;

  @Prop({ default: false })
  isArchived: boolean;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);

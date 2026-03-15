// src/offers/schemas/offerSchema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { OfferTarget } from '../../common/enums/offerTargetEnum';
import { BrandCategory } from 'src/common/enums/brandCategoriesEnum';
import { Language } from 'src/common/enums/languageEnum';

export type OfferDocument = Offer & Document;

export enum OfferStatus {
  ACTIVE = 'active',
  CONCEPT = 'concept',
}

@Schema({ timestamps: true })
export class Offer {
  @Prop({ default: false })
  paidCooperation: boolean;

  @Prop({ required: true })
  name: string;

  @Prop({
    type: [String],
    enum: BrandCategory,
    default: [],
  })
  categories: BrandCategory[];

  @Prop()
  activeFrom?: Date;

  @Prop()
  activeTo?: Date;

  @Prop()
  image?: string;

  @Prop({
    type: [String],
    enum: Language,
    default: [],
  })
  languages: Language[];

  @Prop({
    type: [String],
    enum: OfferTarget,
    default: [],
  })
  targets: OfferTarget[];

  @Prop({ default: '' })
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

  @Prop()
  contact?: string;

  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true })
  brand: Types.ObjectId;

  @Prop({ default: false })
  isArchived: boolean;

  @Prop({ default: OfferStatus.ACTIVE, enum: OfferStatus })
  status: OfferStatus;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);

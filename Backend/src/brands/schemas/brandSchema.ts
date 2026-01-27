import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Country } from '../../common/enums/countryEnum';
import { BrandCategory } from 'src/common/enums/brandCategoriesEnum';
export type BrandDocument = HydratedDocument<Brand>;

@Schema({ timestamps: true })
export class Brand {
  @Prop({ required: true, index: true })
  name: string;

  @Prop()
  ico?: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  //PSČ
  @Prop({ required: true })
  zip: string;

  @Prop({ enum: Country, required: true, index: true })
  country: Country;

  @Prop({ type: [String], enum: BrandCategory, required: true })
  categories: BrandCategory[];

  @Prop({ type: Types.ObjectId, ref: 'Package' })
  package: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  mainContact?: Types.ObjectId;

  @Prop({ default: false })
  isArchived: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Offer' }] })
  offers: Types.ObjectId[];

  @Prop()
  purchasedAt: Date;

  @Prop({ default: 0 })
  offersCount: number;

  @Prop({ required: false }) // logo bude validované cez Zod, aby bolo povinné pre brand_managera
  logo?: string;

  @Prop({ required: false })
  website?: string;

  @Prop({ required: false })
  facebook?: string;

  @Prop({ required: false })
  instagram?: string;

  @Prop({ required: false })
  tiktok?: string;

  @Prop({ required: false })
  pinterest?: string;

  @Prop({ required: false })
  youtube?: string;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);

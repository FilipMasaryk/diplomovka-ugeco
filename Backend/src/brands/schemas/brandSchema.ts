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
}

export const BrandSchema = SchemaFactory.createForClass(Brand);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PackageDocument = HydratedDocument<Package>;

export enum PackageType {
  CREATOR = 'creator',
  BRAND = 'brand',
}

@Schema({ timestamps: true })
export class Package {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  validityMonths: number;

  @Prop({ required: true })
  offersCount: number;

  @Prop({
    type: String,
    enum: PackageType,
    required: true,
    default: PackageType.CREATOR,
  })
  type: PackageType;
}

export const PackageSchema = SchemaFactory.createForClass(Package);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Country } from './countryEnum';
export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  ADMIN = 'admin',
  SUBADMIN = 'subadmin',
  BRAND_MANAGER = 'brand_manager',
  CREATOR = 'creator',
}

@Schema()
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  surName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop()
  password?: string;

  @Prop({
    type: String,
    enum: UserRole,
    required: true,
    default: UserRole.CREATOR,
  })
  role: UserRole;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop()
  initToken?: string;

  @Prop()
  initTokenExpires?: Date;

  @Prop({ default: false })
  isArchived: boolean;

  @Prop()
  archivedAt?: Date;

  //pre Creatora
  @Prop({ type: Types.ObjectId, ref: 'Package' })
  package?: Types.ObjectId;

  //pre Creatora
  @Prop()
  ico?: string;

  //Pre Creatora
  @Prop()
  purchasedAt?: Date;

  //Pre Brand Managera, bude to array Id znaciek neskor
  @Prop({ type: [String] })
  brands?: string[];

  @Prop({
    type: [String],
    enum: Country,
  })
  countries?: Country[];
}

export const UserSchema = SchemaFactory.createForClass(User);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  ADMIN = 'admin',
  SUBADMIN = 'subadmin',
  COMPANY_MANAGER = 'company_manager',
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
}

export const UserSchema = SchemaFactory.createForClass(User);

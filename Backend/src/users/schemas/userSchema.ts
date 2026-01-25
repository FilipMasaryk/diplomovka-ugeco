import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Country } from '../../common/enums/countryEnum';
import { UserRole } from '../../common/enums/userRoleEnum';
import { BrandCategory } from 'src/common/enums/brandCategoriesEnum';
import { OfferTarget } from 'src/common/enums/offerTargetEnum';
export type UserDocument = HydratedDocument<User>;

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

  //Pre Brand Managera
  @Prop({
    type: [Types.ObjectId],
    ref: 'Brand',
    default: [],
  })
  brands: Types.ObjectId[];

  @Prop({
    type: [String],
    enum: Country,
  })
  countries?: Country[];

  @Prop({
    type: [String],
    enum: BrandCategory,
  })
  categories?: BrandCategory[];

  @Prop({
    type: [String],
    enum: OfferTarget,
  })
  creatingWith?: OfferTarget[];

  @Prop()
  portfolio?: string;

  @Prop()
  instagram?: string;

  @Prop()
  pinterest?: string;

  @Prop()
  facebook?: string;

  @Prop()
  tiktok?: string;

  @Prop()
  youtube?: string;

  @Prop()
  image?: string;

  @Prop()
  about?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

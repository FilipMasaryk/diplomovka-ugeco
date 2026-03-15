import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Country } from '../../common/enums/countryEnum';
import { BrandCategory } from '../../common/enums/brandCategoriesEnum';
import { OfferTarget } from '../../common/enums/offerTargetEnum';
import { User } from '../../users/schemas/userSchema';

export type UserProfileDocument = HydratedDocument<UserProfile>;

@Schema({ timestamps: true })
export class UserProfile {
  _id: Types.ObjectId;

  @Prop()
  name?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ type: [String], enum: Country, default: [] })
  languages: Country[];

  @Prop({ type: [String], enum: BrandCategory, default: [] })
  categories: BrandCategory[];

  @Prop({ type: [String], enum: OfferTarget, default: [] })
  creatingAs: OfferTarget[];

  @Prop()
  image?: string;

  @Prop()
  about?: string;

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

  @Prop({ default: false })
  published: boolean;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);

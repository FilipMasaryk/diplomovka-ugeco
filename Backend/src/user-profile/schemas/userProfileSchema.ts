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

  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ type: [String], enum: Country, required: true, default: [] })
  languages: Country[];

  @Prop({ type: [String], enum: BrandCategory, required: true, default: [] })
  categories: BrandCategory[];

  @Prop({ type: [String], enum: OfferTarget, required: true, default: [] })
  creatingAs: OfferTarget[];

  @Prop({ required: true })
  image?: string;

  @Prop({ required: true })
  about: string;

  @Prop({ required: true })
  portfolio: string;

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

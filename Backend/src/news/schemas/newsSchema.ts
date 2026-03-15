import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { NewsCategory } from '../../common/enums/newsCategoryEnum';
import { NewsTarget } from '../../common/enums/newsTargetEnum';
import { NewsStatus } from '../../common/enums/newsStatusEnum';

export type NewsDocument = HydratedDocument<News>;

@Schema({ timestamps: true })
export class News {
  @Prop({ default: '' })
  title: string;

  @Prop({ default: '', maxlength: 2000 })
  description: string;

  @Prop({ enum: NewsCategory })
  category: NewsCategory;

  @Prop({ enum: NewsTarget, required: true })
  target: NewsTarget;

  @Prop()
  image: string;

  @Prop({ enum: NewsStatus, default: NewsStatus.DRAFT })
  status: NewsStatus;

  @Prop()
  publishedAt: Date;
}

export const NewsSchema = SchemaFactory.createForClass(News);

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { User, UserSchema } from 'src/users/schemas/userSchema';
import { Brand, BrandSchema } from 'src/brands/schemas/brandSchema';
import { Offer, OfferSchema } from 'src/offers/schemas/offerSchema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Brand.name, schema: BrandSchema },
      { name: Offer.name, schema: OfferSchema },
    ]),
    AuthModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}

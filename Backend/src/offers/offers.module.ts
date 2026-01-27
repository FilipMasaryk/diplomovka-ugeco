import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer, OfferSchema } from './schemas/offerSchema';
import { Brand, BrandSchema } from 'src/brands/schemas/brandSchema';
import { AuthModule } from 'src/auth/auth.module';
import { Package, PackageSchema } from 'src/packages/schemas/packageSchema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Offer.name, schema: OfferSchema },
      { name: Brand.name, schema: BrandSchema },
      { name: Package.name, schema: PackageSchema },
    ]),
    AuthModule,
  ],
  controllers: [OffersController],
  providers: [OffersService],
})
export class OffersModule {}

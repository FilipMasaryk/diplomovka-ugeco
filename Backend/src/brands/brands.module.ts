import { forwardRef, Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandSchema } from './schemas/brandSchema';
import { Offer, OfferSchema } from '../offers/schemas/offerSchema';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { PackagesModule } from 'src/packages/packages.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Brand.name, schema: BrandSchema },
      { name: Offer.name, schema: OfferSchema },
    ]),

    AuthModule,
    forwardRef(() => UsersModule),
    forwardRef(() => PackagesModule),
  ],
  controllers: [BrandsController],
  providers: [BrandsService],
  exports: [BrandsService],
})
export class BrandsModule {}

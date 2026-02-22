import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/userSchema';
import { AuthModule } from 'src/auth/auth.module';
import { EmailService } from './email.service';
import { Package, PackageSchema } from 'src/packages/schemas/packageSchema';
import { Brand, BrandSchema } from 'src/brands/schemas/brandSchema';
import {
  UserProfile,
  UserProfileSchema,
} from 'src/user-profile/schemas/userProfileSchema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Package.name, schema: PackageSchema }]),
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
    MongooseModule.forFeature([
      { name: UserProfile.name, schema: UserProfileSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, EmailService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}

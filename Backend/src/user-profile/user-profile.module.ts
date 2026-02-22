import { forwardRef, Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProfile, UserProfileSchema } from './schemas/userProfileSchema';
import { AuthModule } from 'src/auth/auth.module';
import { User, UserSchema } from 'src/users/schemas/userSchema';
@Module({
  controllers: [UserProfileController],
  providers: [UserProfileService],
  imports: [
    MongooseModule.forFeature([
      { name: UserProfile.name, schema: UserProfileSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  exports: [UserProfileService],
})
export class UserProfileModule {}

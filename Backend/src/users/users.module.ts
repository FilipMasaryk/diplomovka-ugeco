import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/userSchema';
import { AuthModule } from 'src/auth/auth.module';
import { EmailService } from './email.service';
import { Package, PackageSchema } from 'src/packages/schemas/packageSchema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Package.name, schema: PackageSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, EmailService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PackagesModule } from './packages/packages.module';
import { BrandsModule } from './brands/brands.module';
import { OffersModule } from './offers/offers.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserProfileModule } from './user-profile/user-profile.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'src', 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    UsersModule,
    AuthModule,
    PackagesModule,
    BrandsModule,
    OffersModule,
    UserProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

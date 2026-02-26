import type { Multer } from 'multer';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { AuthGuard } from '../auth/auth.guard';
import { UserRole } from '../common/enums/userRoleEnum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Roles } from 'src/common/decorators/roles.decorator';
import { createOfferSchema } from './schemas/createOfferDto';
import { updateOfferSchema } from './schemas/updateOfferDto';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { InjectModel } from '@nestjs/mongoose';
import { Brand } from 'src/brands/schemas/brandSchema';
import { Model } from 'mongoose';

const storage = diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === 'brandLogo' ? 'brandLogos' : 'offers';
    const uploadPath = path.join(process.cwd(), 'src', 'uploads', folder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

@Controller('offers')
@UseGuards(AuthGuard, RolesGuard)
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    @InjectModel(Brand.name) private readonly brandModel: Model<Brand>,
  ) {}

  @Get('filter')
  @Roles(UserRole.CREATOR)
  async getOffers(
    @Req() req,
    @Query('category') category?: string,
    @Query('target') target?: string | string[],
    @Query('paidCooperation') paidCooperation?: string,
    @Query('language') language?: string | string[],
  ) {
    const targetsArray = Array.isArray(target)
      ? target
      : target
        ? [target]
        : [];

    const languagesArray = Array.isArray(language)
      ? language
      : language
        ? [language]
        : [];

    let isPaid: boolean | undefined = undefined;
    if (paidCooperation === 'true') isPaid = true;
    if (paidCooperation === 'false') isPaid = false;

    const filters = {
      category,
      targets: targetsArray,
      paidCooperation: isPaid,
      languages: languagesArray,
    };

    return this.offersService.findAllForCreator(req.user, filters);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  async getStats() {
    return this.offersService.getStats();
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.BRAND_MANAGER, UserRole.SUBADMIN)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'brandLogo', maxCount: 1 },
      ],
      { storage },
    ),
  )
  async create(
    @Req() req,
    @Body() body: any,
    @UploadedFiles()
    files: { image?: Multer.File[]; brandLogo?: Multer.File[] },
  ) {
    if (files?.image?.[0]) {
      body.image = `/uploads/offers/${files.image[0].filename}`;
    }

    if (files?.brandLogo?.[0] && body.brand) {
      const logoPath = `/uploads/brandLogos/${files.brandLogo[0].filename}`;
      await this.brandModel.findByIdAndUpdate(body.brand, { logo: logoPath });
    }

    const dto = createOfferSchema.parse(body);
    return this.offersService.create(dto, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.BRAND_MANAGER, UserRole.SUBADMIN)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'brandLogo', maxCount: 1 },
      ],
      { storage },
    ),
  )
  async update(
    @Param('id') id: string,
    @Req() req,
    @Body() body: any,
    @UploadedFiles()
    files: { image?: Multer.File[]; brandLogo?: Multer.File[] },
  ) {
    if (files?.image?.[0]) {
      body.image = `/uploads/offers/${files.image[0].filename}`;
    }

    if (files?.brandLogo?.[0]) {
      const offer = await this.offersService.findOne(id, req.user);
      if (offer?.brand) {
        const brandId =
          typeof offer.brand === 'object'
            ? (offer.brand as any)._id
            : offer.brand;
        const logoPath = `/uploads/brandLogos/${files.brandLogo[0].filename}`;
        await this.brandModel.findByIdAndUpdate(brandId, { logo: logoPath });
      }
    }

    const dto = updateOfferSchema.parse(body);
    return this.offersService.update(id, dto, req.user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.BRAND_MANAGER, UserRole.SUBADMIN)
  findAll(@Req() req, @Query('archived') archived?: string) {
    return this.offersService.findAllForUser(req.user, archived === 'true');
  }

  @Roles(
    UserRole.ADMIN,
    UserRole.BRAND_MANAGER,
    UserRole.SUBADMIN,
    UserRole.CREATOR,
  )
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.offersService.findOne(id, req.user);
  }

  @Patch(':id/archive')
  @Roles(UserRole.ADMIN, UserRole.BRAND_MANAGER, UserRole.SUBADMIN)
  archive(@Param('id') id: string, @Req() req) {
    return this.offersService.archive(id, req.user);
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN, UserRole.BRAND_MANAGER, UserRole.SUBADMIN)
  restore(@Param('id') id: string, @Req() req) {
    return this.offersService.restore(id, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.BRAND_MANAGER, UserRole.SUBADMIN)
  remove(@Param('id') id: string, @Req() req) {
    return this.offersService.remove(id, req.user);
  }
}

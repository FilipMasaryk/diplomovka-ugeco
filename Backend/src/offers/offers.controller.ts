import type { Multer } from 'multer';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
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
import { FileInterceptor } from '@nestjs/platform-express';

const storage = diskStorage({
  destination: (req, file, cb) => {
    // upload bude vždy do Backend/src/uploads/offers
    const uploadPath = path.join(process.cwd(), 'src', 'uploads', 'offers');
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
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.BRAND_MANAGER, UserRole.SUBADMIN)
  @UseInterceptors(FileInterceptor('image', { storage }))
  async create(
    @Req() req,
    @Body() body: any,
    @UploadedFile() file: Multer.File,
  ) {
    if (file) {
      body.image = `/uploads/offers/${file.filename}`;
    }

    const dto = createOfferSchema.parse(body);
    return this.offersService.create(dto, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.BRAND_MANAGER, UserRole.SUBADMIN)
  @UseInterceptors(FileInterceptor('image', { storage }))
  update(
    @Param('id') id: string,
    @Req() req,
    @Body(new ZodValidationPipe(updateOfferSchema)) body,
    @UploadedFile() file: Multer.File,
  ) {
    if (file) {
      body.image = `/uploads/offers/${file.filename}`;
    }
    return this.offersService.update(id, body, req.user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.BRAND_MANAGER, UserRole.SUBADMIN)
  findAll(@Req() req) {
    return this.offersService.findAllForUser(req.user);
  }

  @Roles(UserRole.ADMIN, UserRole.BRAND_MANAGER, UserRole.SUBADMIN)
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
}

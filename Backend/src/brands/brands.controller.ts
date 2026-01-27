import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/userRoleEnum';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  createBrandSchema,
  type CreateBrandDto,
} from './schemas/createBrandSchema';
import {
  updateBrandSchema,
  type UpdateBrandDto,
} from './schemas/updateBrandSchema';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import type { Multer } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import path, { extname } from 'path';
import { diskStorage } from 'multer';
import fs from 'fs';

const logoStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'src', 'uploads', 'brandLogos');
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

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  @Post()
  create(
    @Req() req,
    @Body(new ZodValidationPipe(createBrandSchema))
    createBrandDto: CreateBrandDto,
  ) {
    return this.brandsService.create(createBrandDto, req.user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.BRAND_MANAGER)
  @Get()
  findAll(@Req() req) {
    const user = req.user;

    if (user.role === UserRole.ADMIN) {
      return this.brandsService.findAll();
    }

    if (user.role === UserRole.SUBADMIN) {
      return this.brandsService.findByCountries(user.countries ?? []);
    }

    // BRAND_MANAGER
    return this.brandsService.findByIds(user.brands);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.BRAND_MANAGER)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.brandsService.findOneForUser(id, req.user);
  }

  // Mozno sa zmeni este podla toho ci brand manager moze updatovat/ktore polia
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  async updateByAdmin(
    @Param('id') id: string,
    @Req() req,
    @Body(new ZodValidationPipe(updateBrandSchema))
    updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandsService.update(id, updateBrandDto, req.user);
  }

  @Patch('settings/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BRAND_MANAGER)
  @UseInterceptors(FileInterceptor('logo', { storage: logoStorage }))
  async updateLogoByBrandManager(
    @Param('id') id: string,
    @Req() req,
    @Body(new ZodValidationPipe(updateBrandSchema))
    updateBrandDto: UpdateBrandDto,
    @UploadedFile() file?: Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Brand Manager must provide a logo');
    }

    updateBrandDto.logo = `/uploads/brandLogos/${file.filename}`;
    return this.brandsService.updateForUser(id, updateBrandDto, req.user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    return this.brandsService.archive(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.brandsService.restore(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}

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
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.BRAND_MANAGER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req,
    @Body(new ZodValidationPipe(updateBrandSchema))
    updateBrandDto: UpdateBrandDto,
  ) {
    if (req.user.role === UserRole.ADMIN) {
      return this.brandsService.update(id, updateBrandDto, req.user);
    }
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

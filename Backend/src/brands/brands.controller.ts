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
  @Roles(UserRole.ADMIN)
  @Post()
  create(
    @Req() req,
    @Body(new ZodValidationPipe(createBrandSchema))
    createBrandDto: CreateBrandDto,
  ) {
    return this.brandsService.create(createBrandDto, req.user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  @Get()
  findAll(@Req() req) {
    if (req.user.role === UserRole.ADMIN) {
      return this.brandsService.findAll();
    }

    // pre subadmina vrati len tie ku ktorym ma pristup
    return this.brandsService.findByIds(req.user.brands);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    if (req.user.role === UserRole.ADMIN) {
      return this.brandsService.findOne(id);
    }
    return this.brandsService.findOneForUser(id, req.user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req,
    @Body(new ZodValidationPipe(updateBrandSchema))
    updateBrandDto: UpdateBrandDto,
  ) {
    if (req.user.role === UserRole.ADMIN) {
      return this.brandsService.update(id, updateBrandDto);
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

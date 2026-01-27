import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  createUserSchema,
  type CreateUserDto,
} from './schemas/createUserSchema';
import {
  updateUserSchema,
  type UpdateUserDto,
} from './schemas/updateUserSchema';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../common/enums/userRoleEnum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import {
  type UpdateSelfDto,
  updateSelfSchema,
} from './schemas/updateSelfSchema';
import {
  type CreateBrandManagerDto,
  createBrandManagerSchema,
} from './schemas/createBrandManagerSchema';
import {
  type UpdateBrandManagerDto,
  updateBrandManagerSchema,
} from './schemas/updateBrandManagerSchema';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Roles(UserRole.CREATOR)
  @Patch('me')
  async updateMe(
    @Req() req,
    @Body(new ZodValidationPipe(updateSelfSchema))
    updateData: UpdateSelfDto,
  ) {
    return this.usersService.updateSelf(req.user.id, updateData);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  create(
    @Req() req,
    @Body(new ZodValidationPipe(createUserSchema)) createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(createUserDto, req.user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get('archived')
  @Roles(UserRole.ADMIN)
  getArchivedUsers() {
    return this.usersService.findArchived();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  async update(
    @Param('id') id: string,
    @Req() req,
    @Body(new ZodValidationPipe(updateUserSchema)) updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  //archivovanie pouzivatela
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async archive(@Param('id') id: string) {
    return this.usersService.archive(id);
  }

  //obnova archivovaneho pouzivatela
  @UseGuards(AuthGuard, RolesGuard)
  @Post('restore/:id')
  @Roles(UserRole.ADMIN)
  restore(@Param('id') id: string) {
    return this.usersService.restore(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Post('manager/:brandId')
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.BRAND_MANAGER)
  async createManager(
    @Param('brandId') brandId: string,
    @Req() req,
    @Body(new ZodValidationPipe(createBrandManagerSchema))
    dto: CreateBrandManagerDto,
  ) {
    return this.usersService.createBrandManager(dto, brandId, req.user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Patch('manager/:id')
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.BRAND_MANAGER)
  async updateManager(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateBrandManagerSchema))
    dto: UpdateBrandManagerDto,
    @Req() req,
  ) {
    return this.usersService.updateBrandManager(id, dto, req.user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Delete('manager/:id')
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.BRAND_MANAGER)
  async archivemanager(@Param('id') id: string, @Req() req) {
    return this.usersService.archiveBrandManager(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Delete('manager/:userId/brands/:brandId')
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.BRAND_MANAGER)
  async removeAccessFromManager(
    @Param('userId') userId: string,
    @Param('brandId') brandId: string,
    @Req() req,
  ) {
    return this.usersService.removeBrandAccess(userId, brandId, req.user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Post('manager/:id/restore')
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.BRAND_MANAGER)
  async restoreBrandManager(@Param('id') id: string, @Req() req) {
    return this.usersService.restoreBrandManager(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get('/manager/brand/:brandId')
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN, UserRole.BRAND_MANAGER)
  async getBrandManagersByBrand(@Param('brandId') brandId: string) {
    return this.usersService.getBrandManagersByBrand(brandId);
  }
}

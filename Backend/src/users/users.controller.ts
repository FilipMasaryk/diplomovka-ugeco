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
  type UpdateCreatorDto,
  updateCreatorSchema,
} from './schemas/updateCreatorSchema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Patch('me')
  @Roles(UserRole.CREATOR)
  async updateMe(
    @Req() req,
    @Body(new ZodValidationPipe(updateCreatorSchema))
    updateData: UpdateCreatorDto,
  ) {
    // posielame celý objekt req.user do service
    return this.usersService.updateCreator(req.user.id, updateData);
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
}

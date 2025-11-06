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
import { UserRole } from './schemas/userSchema';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body(new ZodValidationPipe(createUserSchema)) createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserSchema)) updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

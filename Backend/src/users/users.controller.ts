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
  @UsePipes(new ZodValidationPipe(createUserSchema))
  create(@Body() createUserDto: CreateUserDto) {
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
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}

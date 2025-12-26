import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { PackagesService } from './packages.service';
import { CreatePackageDto } from './schemas/create-package.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/schemas/userSchema';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { UpdatePackageDto } from './schemas/update-package.dto';
//import { UpdatePackageDto } from './schemas/update-package.dto';

@Controller('packages')
@UseGuards(AuthGuard, RolesGuard)
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body(new ZodValidationPipe(CreatePackageDto))
    body: CreatePackageDto,
  ) {
    return this.packagesService.create(body);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  findAll() {
    return this.packagesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdatePackageDto))
    body: UpdatePackageDto,
  ) {
    return this.packagesService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.packagesService.remove(id);
  }
}

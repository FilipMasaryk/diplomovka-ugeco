import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { AuthGuard } from '../auth/auth.guard';
import { UserRole } from '../common/enums/userRoleEnum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Roles } from 'src/common/decorators/roles.decorator';
import { createOfferSchema } from './schemas/createOfferDto';
import { updateOfferSchema } from './schemas/updateOfferDto';

@Controller('offers')
@UseGuards(AuthGuard, RolesGuard)
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.BRAND_MANAGER, UserRole.SUBADMIN)
  create(@Req() req, @Body(new ZodValidationPipe(createOfferSchema)) body) {
    return this.offersService.create(body, req.user);
  }

  @Get()
  findAll(@Req() req) {
    return this.offersService.findAllForUser(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.offersService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.BRAND_MANAGER, UserRole.SUBADMIN)
  update(
    @Param('id') id: string,
    @Req() req,
    @Body(new ZodValidationPipe(updateOfferSchema)) body,
  ) {
    return this.offersService.update(id, body, req.user);
  }

  @Patch(':id/archive')
  @Roles(UserRole.ADMIN)
  archive(@Param('id') id: string) {
    return this.offersService.archive(id);
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN)
  restore(@Param('id') id: string) {
    return this.offersService.restore(id);
  }
}

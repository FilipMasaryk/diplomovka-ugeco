import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/userRoleEnum';

@Controller('stats')
@UseGuards(AuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  private getCountries(req: any): string[] | undefined {
    const user = req.user;
    if (user.role === UserRole.SUBADMIN && user.countries?.length) {
      return user.countries;
    }
    return undefined;
  }

  @Get('overview')
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  async getOverview(@Req() req: any) {
    return this.statsService.getOverview(this.getCountries(req));
  }

  @Get('monthly')
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  async getMonthly(@Req() req: any) {
    return this.statsService.getMonthlyOverview(7, this.getCountries(req));
  }

  @Get('roles')
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  async getRoleDistribution(@Req() req: any) {
    return this.statsService.getRoleDistribution(this.getCountries(req));
  }

  @Get('categories')
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  async getCategoryDistribution(@Req() req: any) {
    return this.statsService.getCategoryDistribution(this.getCountries(req));
  }

  @Get('countries')
  @Roles(UserRole.ADMIN, UserRole.SUBADMIN)
  async getCountryDistribution(@Req() req: any) {
    return this.statsService.getCountryDistribution(this.getCountries(req));
  }
}

import { Controller, Get, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { type DashboardType } from './types/dashboardType';
import { Roles } from '../common/decorators/roles.decorator';
import { type AuthenticatedRequestType } from '../common/types/shared.types';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles('super_admin')
  @Get()
  async getDashboardSummary(
    @Request() req: AuthenticatedRequestType,
  ): Promise<DashboardType> {
    return this.dashboardService.getDashboardSummary(req.user);
  }
}

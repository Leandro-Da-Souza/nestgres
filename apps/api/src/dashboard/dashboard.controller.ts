import { Controller, Get, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Roles } from '../common/decorators/roles.decorator';
import { type AuthenticatedRequestType } from '../common/types/shared.types';
import { DashboardData } from '@nestgres/contracts';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles('super_admin')
  @Get()
  async getDashboardSummary(
    @Request() req: AuthenticatedRequestType,
  ): Promise<DashboardData> {
    return this.dashboardService.getDashboardSummary(req.user);
  }
}

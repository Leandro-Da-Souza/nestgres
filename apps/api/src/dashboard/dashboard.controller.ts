import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { type DashboardType } from './types/dashboardType';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardSummary(): Promise<DashboardType> {
    return this.dashboardService.getDashboardSummary();
  }
}

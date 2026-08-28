import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DatabaseModule } from '../database/database.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [DatabaseModule, OrganizationsModule, InvoicesModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

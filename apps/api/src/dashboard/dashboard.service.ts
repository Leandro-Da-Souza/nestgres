import { Inject, Injectable } from '@nestjs/common';
import { PG_POOL } from '../database/database.constants';
import { Pool } from 'pg';
import { DashboardTotalType, DashboardType } from './types/dashboardType';
import { OrganizationsService } from '../organizations/organizations.service';
import { InvoicesService } from '../invoices/invoices.service';
import { JwtPayloadType } from '../common/types/shared.types';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(PG_POOL)
    private readonly pool: Pool,
    private readonly organizationService: OrganizationsService,
    private readonly invoiceService: InvoicesService,
  ) {}

  public async getDashboardTotal(): Promise<DashboardTotalType> {
    const query = {
      text: `
        SELECT 
          (SELECT COUNT(*)::int FROM organizations) 
            AS "organizations",
          (SELECT COUNT(*)::int FROM invoices)
            AS "invoices",
          (SELECT COUNT(*)::int FROM users WHERE users.active)
            AS "activeUsers",
          COALESCE(
            (SELECT SUM(amount) FROM invoices),
            0
          ) AS "totalInvoiceAmount",
          COALESCE(
            (SELECT SUM(amount) FROM invoices WHERE status IN ('open', 'overdue')),
            0
          ) AS "outstandingAmount"
      `,
    };

    const result = await this.pool.query<DashboardTotalType>(query);
    return result.rows[0];
  }

  public async getDashboardSummary(
    user: JwtPayloadType,
  ): Promise<DashboardType> {
    const [totals, organizations, recentInvoices] = await Promise.all([
      this.getDashboardTotal(),
      this.organizationService.getOrganizationSummaries(),
      this.invoiceService.getRecentInvoices(user),
    ]);

    return {
      totals,
      organizations,
      recentInvoices,
    };
  }
}

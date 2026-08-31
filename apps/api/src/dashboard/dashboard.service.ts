import { Inject, Injectable } from '@nestjs/common';
import { PG_POOL } from '../database/database.constants';
import { Pool } from 'pg';
import { DashboardTotalType, DashboardType } from './types/dashboardType';
import { OrganizationsService } from '../organizations/organizations.service';
import { InvoicesService } from '../invoices/invoices.service';
import { JwtPayloadType } from '../common/types/shared.types';
import { filter } from 'rxjs';
type DashboardCounts = Omit<DashboardTotalType, 'amountsByCurrency'>;

@Injectable()
export class DashboardService {
  constructor(
    @Inject(PG_POOL)
    private readonly pool: Pool,
    private readonly organizationService: OrganizationsService,
    private readonly invoiceService: InvoicesService,
  ) {}

  public async getDashboardTotal(): Promise<DashboardCounts> {
    const query = {
      text: `
        SELECT 
          (SELECT COUNT(*)::int FROM organizations) 
            AS "organizations",
          (SELECT COUNT(*)::int FROM invoices)
            AS "invoices",
          (SELECT COUNT(*)::int FROM users WHERE users.active)
            AS "activeUsers"
      `,
    };

    const result = await this.pool.query<DashboardCounts>(query);
    return result.rows[0];
  }

  public async getDashboardSummary(
    user: JwtPayloadType,
  ): Promise<DashboardType> {
    const [
      totals,
      amountsByCurrency,
      organizations,
      orgCurrencyTotals,
      recentInvoices,
    ] = await Promise.all([
      this.getDashboardTotal(),
      this.invoiceService.getGroupedCurrencies(),
      this.organizationService.getOrganizationSummaries(),
      this.invoiceService.getOrganizationCurrencyTotals(),
      this.invoiceService.getRecentInvoices(user),
    ]);

    const organizationSummaries = organizations.map((org) => ({
      ...org,
      amountsByCurrency: orgCurrencyTotals
        .filter((row) => row.organizationId === org.organizationId)
        .map((row) => ({
          currency: row.currency,
          totalInvoiceAmount: row.totalInvoiceAmount,
          totalOutstandingAmount: row.totalOutstandingAmount,
        })),
    }));

    return {
      totals: {
        ...totals,
        amountsByCurrency,
      },
      organizations: organizationSummaries,
      recentInvoices,
    };
  }
}

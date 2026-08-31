import { OrganizationSummaryType } from '../../organizations/types/organizationSummaryType';
import { InvoiceType } from '../../invoices/types/invoiceType';
import { CurrencyTotalType } from '../../invoices/types/currencyType';

export type DashboardTotalType = {
  organizations: number;
  invoices: number;
  activeUsers: number;
  amountsByCurrency: CurrencyTotalType[];
};

export type DashboardType = {
  totals: DashboardTotalType;
  organizations: OrganizationSummaryType[];
  recentInvoices: InvoiceType[];
};

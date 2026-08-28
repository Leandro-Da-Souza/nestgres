import { OrganizationSummaryType } from '../../organizations/types/organizationSummaryType';
import { InvoiceType } from '../../invoices/types/invoiceType';

export type DashboardTotalType = {
  organizations: number;
  invoices: number;
  activeUsers: number;
  totalInvoiceAmount: string;
  outstandingAmount: string;
};

export type DashboardType = {
  totals: DashboardTotalType;
  organizations: OrganizationSummaryType[];
  recentInvoices: InvoiceType[];
};

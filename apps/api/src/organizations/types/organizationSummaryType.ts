import { CurrencyTotalType } from '../../invoices/types/currencyType';

export type OrganizationSummaryType = {
  organizationId: number;
  organizationName: string;
  numberOfUsers: number;
  numberOfInvoices: number;
  amountsByCurrency: CurrencyTotalType[];
};

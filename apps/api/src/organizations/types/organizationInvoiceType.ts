import { InvoiceStatus } from '../../invoices/types/invoiceType';

export type OrganizationInvoiceType = {
  invoiceId: number;
  organizationId: number;
  organizationName: string;
  amount: string;
  currency: string;
  status: InvoiceStatus;
  issuedOn: string;
  dueOn: string;
  paidAt: Date | null;
};

import { InvoiceStatus } from '../../invoices/types/invoiceType';

export type OrganizationInvoiceType = {
  invoiceId: number;
  organizationId: number;
  organizationName: string;
  amount: string;
  currency: string;
  status: InvoiceStatus;
  issuedOn: Date;
  dueOn: Date;
  paidAt: Date | null;
};

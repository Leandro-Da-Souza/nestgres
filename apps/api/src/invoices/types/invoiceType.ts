export const INVOICE_STATUSES = ['open', 'paid', 'overdue', 'void'] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export type InvoiceType = {
  id: number;
  organizationId: number;
  amount: string;
  currency: string;
  status: InvoiceStatus;
  issuedOn: Date;
  dueOn: Date;
  paidAt: Date | null;
  createdAt: Date;
};

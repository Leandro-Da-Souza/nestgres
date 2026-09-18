import type { InvoiceStatus } from '@nestgres/contracts';

export const INVOICE_STATUSES = [
  'open',
  'paid',
  'overdue',
  'void',
] as const satisfies readonly InvoiceStatus[];

import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { InvoiceDetailData } from '../../resolvers/invoice-detail-resolver';
import { Badge } from '../../../../ui/badge/badge';
import { CurrencyPipe, DatePipe, formatDate } from '@angular/common';
import { InvoiceService } from '../../invoice.service';
import { InvoiceStatus } from '@nestgres/contracts';

@Component({
  imports: [Badge, RouterLink, CurrencyPipe, DatePipe],
  selector: 'app-invoice-detail',
  styleUrl: './invoice-detail.scss',
  templateUrl: './invoice-detail.html',
})
export class InvoiceDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly invoiceService = inject(InvoiceService);
  private readonly data = toSignal(this.route.data, { requireSync: true });
  private readonly detail = computed(() => this.data()['detail'] as InvoiceDetailData);

  protected readonly invoice = computed(() => this.detail().invoice);
  protected readonly organization = computed(() => this.detail().organization);
  protected readonly badgeMap = this.invoiceService.badgeMap;

  protected readonly paymentDueLabel = computed(() => {
    const invoice = this.invoice();

    if (invoice.status === 'paid') {
      return invoice.paidAt ? `Paid on ${formatDate(invoice.paidAt, 'medium', 'EN')}` : 'Paid';
    }
    if (invoice.status === 'void') {
      return 'Invoice voided';
    }

    const [year, month, day] = invoice.dueOn.split('-').map(Number);

    const dueDate = new Date(year, month - 1, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const days = Math.round((dueDate.getTime() - today.getTime()) / millisecondsPerDay);

    if (days === 0) {
      return 'Due today';
    }

    if (days === 1) {
      return 'Due tomorrow';
    }

    if (days > 1) {
      return `${days} days remaining`;
    }

    if (days === -1) {
      return '1 day overdue';
    }

    return `${Math.abs(days)} days overdue`;
  });

  protected readonly daysUntilDue = computed(() => {
    const [year, month, day] = this.invoice().dueOn.split('-').map(Number);

    const dueDate = new Date(year, month - 1, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Math.round((dueDate.getTime() - today.getTime()) / 86_400_000);
  });

  protected readonly displayStatus = computed<InvoiceStatus>(() => {
    const status = this.invoice().status;

    if (status === 'open' && this.daysUntilDue() < 0) {
      return 'overdue';
    }

    return status;
  });
}

import { Component, computed, inject, Signal } from '@angular/core';
import { InvoiceService } from '../../invoice.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Invoice, Organization } from '@nestgres/contracts';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { StatCard } from '../../../../ui/stat-card/stat-card';
import { RouterLink } from '@angular/router';
import { OrganizationService } from '../../../organizations/organization.service';
import { Doughnut } from '../../../../ui/doughnut/doughnut';
import { ChartData } from 'chart.js';

@Component({
  imports: [RouterLink, CurrencyPipe, DatePipe, Doughnut],
  selector: 'app-invoices',
  styleUrl: './invoices.scss',
  templateUrl: './invoices.html',
})
export class Invoices {
  private readonly invoiceService = inject(InvoiceService);
  private readonly organizationService = inject(OrganizationService);

  public readonly invoices: Signal<Invoice[]> = toSignal(
    this.invoiceService.getInvoices().pipe(map((invoice) => invoice.data)),
    { initialValue: [] },
  );

  protected readonly organizationOptions: Signal<Pick<Organization, 'id' | 'name'>[]> = toSignal(
    this.organizationService
      .getOrganizationOptions()
      .pipe(map((organization) => organization.data)),
    { initialValue: [] },
  );

  public readonly organizationNameById = computed(
    () => new Map(this.organizationOptions().map((org) => [org.id, org.name])),
  );

  public readonly doughnutData = computed<ChartData<'doughnut'>>(() => {
    const invoices = this.invoices();

    return {
      labels: ['Paid', 'Open', 'Overdue', 'Void'],
      datasets: [
        {
          data: [
            invoices.filter((invoice) => invoice.status === 'paid').length,
            invoices.filter((invoice) => invoice.status === 'open').length,
            invoices.filter((invoice) => invoice.status === 'overdue').length,
            invoices.filter((invoice) => invoice.status === 'void').length,
          ],
        },
      ],
    };
  });
}

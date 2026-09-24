import { Component, inject, Signal } from '@angular/core';
import { InvoiceService } from '../../invoice.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Invoice } from '@nestgres/contracts';
import { JsonPipe } from '@angular/common';

@Component({
  imports: [JsonPipe],
  selector: 'app-invoices',
  styleUrl: './invoices.scss',
  templateUrl: './invoices.html',
})
export class Invoices {
  private readonly invoiceService = inject(InvoiceService);

  public readonly invoices: Signal<Invoice[]> = toSignal(
    this.invoiceService.getInvoices().pipe(map((invoice) => invoice.data)),
    { initialValue: [] },
  );
}

import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { JsonPipe } from '@angular/common';
import { InvoiceDetailData } from '../../resolvers/invoice-detail-resolver';

@Component({
  imports: [JsonPipe],
  selector: 'app-invoice-detail',
  styleUrl: './invoice-detail.scss',
  templateUrl: './invoice-detail.html',
})
export class InvoiceDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly data = toSignal(this.route.data, { requireSync: true });
  public readonly detail = computed(() => this.data()['detail'] as InvoiceDetailData);
}

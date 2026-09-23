import { Component, computed, inject, input, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import type {
  Currency,
  Organization,
  OrganizationPlan,
  OrganizationSummary,
} from '@nestgres/contracts';
import { OrganizationDetailData } from '../../resolvers/organization-detail-resolver';
import { JsonPipe } from '@angular/common';
import { BarChart } from '../../../../ui/bar-chart/bar-chart.component';
import { ChartData } from 'chart.js';

@Component({
  imports: [BarChart],
  selector: 'app-organization-detail',
  styleUrl: './organization-detail.scss',
  templateUrl: './organization-detail.html',
})
export class OrganizationDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly data = toSignal(this.route.data, { requireSync: true });
  public readonly detail = computed(() => this.data()['detail'] as OrganizationDetailData);

  public organization = computed(() => this.detail().organization as Organization);
  public summary = computed(() => this.detail().summary as OrganizationSummary);
  public amounts = computed(() => this.summary().amountsByCurrency);

  public organizationDetailChartData = computed<ChartData<'bar'>>(() => {
    const amounts = this.amounts();

    return {
      labels: amounts.map((currency) => currency.currency),
      datasets: [
        {
          label: 'Paid',
          data: amounts.map(
            (currency) =>
              Number(currency.totalInvoiceAmount ?? 0) -
              Number(currency.totalOutstandingAmount ?? 0),
          ),
        },
        {
          label: 'Outstanding',
          data: amounts.map((currency) => Number(currency.totalOutstandingAmount)),
        },
      ],
    };
  });
}

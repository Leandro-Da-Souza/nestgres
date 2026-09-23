import { Component, computed, inject, signal } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { map } from 'rxjs';
import { BarChart } from '../../../../ui/bar-chart/bar-chart.component';
import { ChartData } from 'chart.js';
import { Currency } from '@nestgres/contracts';
import { Button } from '../../../../ui/button/button';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  imports: [BarChart, Button],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);

  protected readonly dashboard$ = this.dashboardService
    .getDashboard()
    .pipe(map((response) => response.data));

  protected readonly organizations$ = this.dashboard$.pipe(
    map((response) => response.organizations),
  );

  protected readonly organizations = toSignal(this.organizations$, {
    initialValue: [],
  });

  protected selectedCurrency = signal<Currency>('EUR');
  protected allowedCurrencies: Currency[] = ['EUR', 'SEK', 'USD'];

  protected handleSelectCurrency(cur: Currency) {
    this.selectedCurrency.set(cur);
  }

  protected readonly organizationChartData = computed<ChartData<'bar'>>(() => {
    const organizations = this.organizations();
    const currency = this.selectedCurrency();

    return {
      labels: organizations.map((org) => org.organizationName),
      datasets: [
        {
          label: 'Total Invoiced',
          data: organizations.map((org) => {
            const amounts = org.amountsByCurrency.find((amount) => amount.currency === currency);

            return Number(amounts?.totalInvoiceAmount ?? 0);
          }),
        },
        {
          label: 'Total Outstanding',
          data: organizations.map((org) => {
            const amounts = org.amountsByCurrency.find((amount) => amount.currency === currency);

            return Number(amounts?.totalOutstandingAmount ?? 0);
          }),
        },
      ],
    };
  });
}

import { Component, inject } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { map } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { GroupedBarChart } from '../../../../ui/grouped-bar-chart/grouped-bar-chart';
import { ChartData } from 'chart.js';

@Component({
  imports: [AsyncPipe, GroupedBarChart],
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

  protected readonly organizationChartData$ = this.organizations$.pipe(
    map(
      (organization) =>
        ({
          labels: organization.map((org) => org.organizationName),
          datasets: [
            {
              label: 'Total Invoiced',
              data: organization.map((org) => {
                const euro = org.amountsByCurrency.find((amounts) => amounts.currency === 'EUR');
                return Number(euro?.totalInvoiceAmount ?? 0);
              }),
            },
            {
              label: 'Total Outstanding',
              data: organization.map((org) => {
                const euro = org.amountsByCurrency.find((amount) => amount.currency === 'EUR');
                return Number(euro?.totalOutstandingAmount ?? 0);
              }),
            },
          ],
        }) satisfies ChartData<'bar'>,
    ),
  );
}

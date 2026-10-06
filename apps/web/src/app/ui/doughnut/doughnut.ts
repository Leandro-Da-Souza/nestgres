import { Component, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  imports: [BaseChartDirective],
  selector: 'app-doughnut',
  styleUrl: './doughnut.scss',
  templateUrl: './doughnut.html',
})
export class Doughnut {
  public readonly data = input.required<ChartData<'doughnut'>>();
  protected readonly options: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
  };
}

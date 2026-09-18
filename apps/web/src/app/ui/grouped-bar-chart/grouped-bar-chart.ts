import { Component, computed, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  imports: [BaseChartDirective],
  selector: 'app-grouped-bar-chart',
  styleUrl: './grouped-bar-chart.scss',
  templateUrl: './grouped-bar-chart.html',
})
export class GroupedBarChart {
  readonly title = input('');
  readonly data = input.required<ChartData<'bar'>>();

  readonly options = computed<ChartConfiguration<'bar'>['options']>(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      title: {
        display: this.title().length > 0,
        text: this.title(),
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }));
}

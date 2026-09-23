import { Component, computed, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  imports: [BaseChartDirective],
  selector: 'app-bar-chart',
  styleUrl: './bar-chart.component.scss',
  templateUrl: './bar-chart.html',
})
export class BarChart {
  readonly title = input('');
  readonly data = input.required<ChartData<'bar'>>();
  readonly stacked = input(false);

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
      x: {
        stacked: this.stacked(),
      },
      y: {
        beginAtZero: true,
        stacked: this.stacked(),
      },
    },
  }));
}

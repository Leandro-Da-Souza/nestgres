import { Component, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';

@Component({
  imports: [],
  selector: 'app-badge',
  styleUrl: './badge.scss',
  templateUrl: './badge.html',
})
export class Badge {
  public label = input.required<string>();
  public tone = input<BadgeTone>('neutral');
}

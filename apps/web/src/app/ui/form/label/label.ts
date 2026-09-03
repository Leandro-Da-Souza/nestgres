import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-label',
  styleUrl: './label.scss',
  templateUrl: './label.html',
})
export class Label {
  public for = input.required<string>();
}

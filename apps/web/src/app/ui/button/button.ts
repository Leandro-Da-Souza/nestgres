import { Component, input, output, computed } from '@angular/core';

type ButtonType = 'button' | 'submit' | 'reset';
type ButtonVariant = 'primary' | 'secondary' | 'danger';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-button',
  styleUrl: './button.scss',
  templateUrl: './button.html',
})
export class Button {
  public type = input<ButtonType>('button');
  public variant = input<ButtonVariant>('primary');
  public disabled = input(false);
  public className = input('');
  public classes = computed(() => `custom-button button-${this.variant()} ${this.className()} `);

  public clicked = output<void>();

  protected handleClick(): void {
    if (this.disabled()) return;

    this.clicked.emit();
  }
}

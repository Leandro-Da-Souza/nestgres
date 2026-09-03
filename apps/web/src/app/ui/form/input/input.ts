import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type InputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';

@Component({
  imports: [],
  selector: 'app-input',
  styleUrl: './input.scss',
  templateUrl: './input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Input),
      multi: true,
    },
  ],
})
export class Input implements ControlValueAccessor {
  protected value = signal('');
  protected disabled = signal(false);

  public type = input<InputType>('text');
  public id = input('');
  public placeholder = input('');
  public autocomplete = input('');
  public invalid = input(false);

  private onChange = (value: string) => {};
  private onTouched = () => {};

  public handleInput(event: Event): void {
    if (this.disabled()) return;

    const input = event.target as HTMLInputElement;

    this.value.set(input.value);
    this.onChange(input.value);
  }

  public handleBlur(): void {
    this.onTouched();
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}

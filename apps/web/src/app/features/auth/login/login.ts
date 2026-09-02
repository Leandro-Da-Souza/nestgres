import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '../../../ui/button/button';
import { FormField } from '../../../ui/form/form-field/form-field';

@Component({
  imports: [ReactiveFormsModule, Button, FormField],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', Validators.required],
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAsTouched();
      return;
    }

    const credentials = this.loginForm.getRawValue();
    console.log(credentials);
  }
}

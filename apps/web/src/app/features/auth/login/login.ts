import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '../../../ui/button/button';
import { FormField } from '../../../ui/form/form-field/form-field';
import { Label } from '../../../ui/form/label/label';
import { Input } from '../../../ui/form/input/input';
import { Auth } from '../auth';

@Component({
  imports: [ReactiveFormsModule, Button, FormField, Label, Input],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);

  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', Validators.required],
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAsTouched();
      return;
    }

    const credentials = this.loginForm.getRawValue();

    this.auth.login(credentials).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error: unknown) => {
        console.error(error);
      },
    });
  }
}

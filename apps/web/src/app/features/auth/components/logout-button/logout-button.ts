import { Component, inject } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Button } from '../../../../ui/button/button';
import { Router } from '@angular/router';

@Component({
  imports: [Button],
  selector: 'app-logout-button',
  styleUrl: './logout-button.scss',
  templateUrl: './logout-button.html',
})
export class LogoutButton {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected handleLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        void this.router.navigate(['/login']);
      },
      error: (error: unknown) => {
        console.error(error);
      },
    });
  }
}

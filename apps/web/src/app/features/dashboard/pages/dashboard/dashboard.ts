import { Component, inject } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { AuthService } from '../../../auth/auth.service';
import { map } from 'rxjs';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
  imports: [AsyncPipe, JsonPipe],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);

  protected readonly dashboard$ = this.dashboardService
    .getDashboard()
    .pipe(map((response) => response.data));
}

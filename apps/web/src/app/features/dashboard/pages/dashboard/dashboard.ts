import { Component, inject } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  imports: [],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);
}

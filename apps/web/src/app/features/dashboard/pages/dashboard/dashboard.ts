import { Component, inject } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { AuthService } from '../../../auth/auth.service';
import { Button } from '../../../../ui/button/button';
import { Router } from '@angular/router';

@Component({
  imports: [Button],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);
}

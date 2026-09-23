import { Component, input } from '@angular/core';
import { OrganizationPlan } from '@nestgres/contracts';

@Component({
  imports: [],
  selector: 'app-plan-badge',
  styleUrl: './plan-badge.scss',
  templateUrl: './plan-badge.html',
})
export class PlanBadge {
  public plan = input.required<OrganizationPlan>();
}

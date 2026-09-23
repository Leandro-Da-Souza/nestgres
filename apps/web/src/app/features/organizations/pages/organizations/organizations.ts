import { Component, inject } from '@angular/core';
import { OrganizationService } from '../../organization.service';
import { map } from 'rxjs';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Button } from '../../../../ui/button/button';
import { PlanBadge } from '../../../../ui/plan-badge/plan-badge';

@Component({
  imports: [AsyncPipe, DatePipe, Button, PlanBadge],
  selector: 'app-organizations',
  styleUrl: './organizations.scss',
  templateUrl: './organizations.html',
})
export class Organizations {
  private readonly orgService = inject(OrganizationService);
  private readonly router = inject(Router);

  protected organizationData$ = this.orgService.getOrganizations().pipe(
    map((response) => {
      return response.data;
    }),
  );

  protected handleNavigation(id: number) {
    void this.router.navigate(['organizations', id]);
  }
}

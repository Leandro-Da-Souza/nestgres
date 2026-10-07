import { Component, inject } from '@angular/core';
import { OrganizationService } from '../../organization.service';
import { map } from 'rxjs';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Button } from '../../../../ui/button/button';
import { Badge } from '../../../../ui/badge/badge';

@Component({
  imports: [AsyncPipe, DatePipe, Button, Badge],
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

  public badgeMap = this.orgService.organizationBadgeMap;

  protected handleNavigation(id: number) {
    void this.router.navigate(['organizations', id]);
  }
}

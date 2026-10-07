import { Component, inject } from '@angular/core';
import { OrganizationService } from '../../organization.service';
import { map } from 'rxjs';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Badge } from '../../../../ui/badge/badge';
import { Table } from '../../../../ui/table/table';

@Component({
  imports: [AsyncPipe, DatePipe, RouterLink, Badge, Table],
  selector: 'app-organizations',
  styleUrl: './organizations.scss',
  templateUrl: './organizations.html',
})
export class Organizations {
  private readonly orgService = inject(OrganizationService);

  protected organizationData$ = this.orgService.getOrganizations().pipe(
    map((response) => {
      return response.data;
    }),
  );

  public badgeMap = this.orgService.organizationBadgeMap;
}

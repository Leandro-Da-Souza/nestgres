import { Component, inject } from '@angular/core';
import { OrganizationService } from '../../organization.service';
import { async, map } from 'rxjs';
import { AsyncPipe, DatePipe, JsonPipe } from '@angular/common';

@Component({
  imports: [AsyncPipe, DatePipe],
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
}

import { Component, inject } from '@angular/core';
import { OrganizationService } from '../../organization.service';
import { async, map } from 'rxjs';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
  imports: [AsyncPipe, JsonPipe],
  selector: 'app-organizations',
  styleUrl: './organizations.scss',
  templateUrl: './organizations.html',
})
export class Organizations {
  private readonly orgService = inject(OrganizationService);

  protected organizationData$ = this.orgService.getOrganizations().pipe(
    map((response) => {
      console.log(response);
      return response.data;
    }),
  );
}

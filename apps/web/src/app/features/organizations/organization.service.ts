import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrganizationsResponse } from '@nestgres/contracts';

@Service()
export class OrganizationService {
  private readonly http = inject(HttpClient);

  public getOrganizations(): Observable<OrganizationsResponse> {
    return this.http.get<OrganizationsResponse>('/api/organizations');
  }
}

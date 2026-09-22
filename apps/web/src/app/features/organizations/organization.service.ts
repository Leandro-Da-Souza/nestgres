import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type {
  ApiResponse,
  Organization,
  OrganizationsResponse,
  OrganizationSummary,
} from '@nestgres/contracts';

@Service()
export class OrganizationService {
  private readonly http = inject(HttpClient);

  public getOrganizations(): Observable<OrganizationsResponse> {
    return this.http.get<OrganizationsResponse>('/api/organizations');
  }

  public getOrganizationById(id: number): Observable<ApiResponse<Organization>> {
    return this.http.get<ApiResponse<Organization>>(`/api/organizations/${id}`);
  }

  public getOrganizationSummary(id: number): Observable<ApiResponse<OrganizationSummary>> {
    return this.http.get<ApiResponse<OrganizationSummary>>(`/api/organizations/${id}/summary`);
  }
}

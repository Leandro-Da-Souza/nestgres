import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type {
  ApiResponse,
  Organization,
  OrganizationPlan,
  OrganizationsResponse,
  OrganizationSummary,
} from '@nestgres/contracts';
import { BadgeTone } from '../../ui/badge/badge';

@Service()
export class OrganizationService {
  private readonly http = inject(HttpClient);

  public organizationBadgeMap = new Map<OrganizationPlan, BadgeTone>([
    ['enterprise', 'success'],
    ['pro', 'accent'],
    ['free', 'info'],
  ]);

  public getOrganizations(): Observable<OrganizationsResponse> {
    return this.http.get<OrganizationsResponse>('/api/organizations');
  }

  public getOrganizationById(id: number): Observable<ApiResponse<Organization>> {
    return this.http.get<ApiResponse<Organization>>(`/api/organizations/${id}`);
  }

  public getOrganizationSummary(id: number): Observable<ApiResponse<OrganizationSummary>> {
    return this.http.get<ApiResponse<OrganizationSummary>>(`/api/organizations/${id}/summary`);
  }

  public getOrganizationOptions(): Observable<ApiResponse<Pick<Organization, 'id' | 'name'>[]>> {
    return this.http.get<ApiResponse<Pick<Organization, 'id' | 'name'>[]>>(
      '/api/organizations/options',
    );
  }
}

import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardResponse } from '@nestgres/contracts';

@Service()
export class DashboardService {
  private readonly http = inject(HttpClient);

  public getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>('/api/dashboard');
  }
}

import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type AuthenticatedUser = {
  id: number;
  organizationId: number | null;
  displayName: string;
  email: string;
  role: 'member' | 'admin' | 'super_admin';
  active: boolean;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type MetaResponse = {
  timestamp: string;
  durationMs: number;
  path: string;
  method: string;
};

export type ApiResponse = {
  data: {
    user: AuthenticatedUser;
  };
  meta: MetaResponse;
};

@Service()
export class Auth {
  private http = inject(HttpClient);

  public login(credentials: LoginCredentials): Observable<ApiResponse> {
    return this.http.post<ApiResponse>('/auth/login', credentials);
  }

  public getProfile(): Observable<any> {
    return this.http.get<any>('/auth/profile');
  }
}

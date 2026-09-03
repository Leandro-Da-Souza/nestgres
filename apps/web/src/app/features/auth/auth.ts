import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    access_token: string;
  };
  meta: MetaResponse;
};

@Service()
export class Auth {
  private http = inject(HttpClient);

  public login(credentials: LoginCredentials): Observable<ApiResponse> {
    return this.http.post<ApiResponse>('/auth/login', credentials);
  }
}

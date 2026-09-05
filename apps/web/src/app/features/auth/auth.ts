import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { ProfileResponse, LoginResponse, LoginRequest } from '@nestgres/contracts';

@Service()
export class Auth {
  private http = inject(HttpClient);

  public login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/auth/login', credentials);
  }

  public getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>('/auth/profile');
  }
}

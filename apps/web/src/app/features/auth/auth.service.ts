import { computed, inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import type {
  ProfileResponse,
  LoginResponse,
  LoginRequest,
  AuthenticatedUser,
} from '@nestgres/contracts';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly currentUser = signal<AuthenticatedUser | null>(null);
  public readonly user = this.currentUser.asReadonly();
  public readonly isAuthenticated = computed(() => this.user() !== null);

  public login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/auth/login', credentials).pipe(
      tap((response) => {
        this.currentUser.set(response.data.user);
      }),
    );
  }

  public getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>('/auth/profile').pipe(
      tap((response) => {
        this.currentUser.set(response.data);
      }),
    );
  }
}

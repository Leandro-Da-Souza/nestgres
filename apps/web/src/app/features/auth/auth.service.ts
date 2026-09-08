import { computed, inject, Service, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, EMPTY, Observable, tap, throwError } from 'rxjs';
import type {
  ProfileResponse,
  LoginResponse,
  LoginRequest,
  AuthenticatedUser,
} from '@nestgres/contracts';
import { AuthStatus } from './types/auth.types';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly currentUser = signal<AuthenticatedUser | null>(null);
  public readonly user = this.currentUser.asReadonly();
  private readonly currentStatus = signal<AuthStatus>('checking');
  public readonly status = this.currentStatus.asReadonly();

  public readonly isAuthenticated = computed(() => this.status() === 'authenticated');

  public login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/auth/login', credentials).pipe(
      tap((response) => {
        this.currentUser.set(response.data.user);
        this.currentStatus.set('authenticated');
      }),
    );
  }

  public logout(): Observable<void> {
    return this.http.post<void>('/auth/logout', {}).pipe(
      tap(() => {
        this.currentStatus.set('anonymous');
        this.currentUser.set(null);
      }),
    );
  }

  public getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>('/auth/profile').pipe(
      tap((response) => {
        this.currentUser.set(response.data);
        this.currentStatus.set('authenticated');
      }),
    );
  }

  public restoreSession(): Observable<ProfileResponse> {
    return this.getProfile().pipe(
      catchError((error: HttpErrorResponse) => {
        this.currentUser.set(null);

        if (error.status === 401) {
          this.currentStatus.set('anonymous');
        } else {
          this.currentStatus.set('error');
        }

        return EMPTY;
      }),
    );
  }
}

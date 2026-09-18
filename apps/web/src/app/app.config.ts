import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from './features/auth/auth.service';
import { unauthorizedInterceptor } from './features/auth/interceptors/unauthorized-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([unauthorizedInterceptor])
    ),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.restoreSession();
    }),
  ],
};

import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { authGuard } from './features/auth/guards/auth.guard';
import { guestGuard } from './features/auth/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    component: Login,
    title: 'Login',
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    title: 'Dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard/dashboard').then((module) => module.Dashboard),
  },
];

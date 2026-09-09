import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { authGuard } from './features/auth/guards/auth.guard';
import { guestGuard } from './features/auth/guards/guest.guard';
import { AuthenticatedLayout } from './layouts/authenticated-layout/authenticated-layout/authenticated-layout';
import { NotFound } from './features/not-found/not-found';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    component: Login,
    title: 'Login',
  },
  {
    path: '',
    canActivate: [authGuard],
    component: AuthenticatedLayout,
    children: [
      {
        path: 'dashboard',
        canActivate: [authGuard],
        title: 'Dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard').then(
            (module) => module.Dashboard,
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: '**',
        component: NotFound,
        title: '404',
      },
    ],
  },
];

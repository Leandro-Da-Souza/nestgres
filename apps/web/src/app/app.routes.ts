import { Data, Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { authGuard } from './features/auth/guards/auth.guard';
import { guestGuard } from './features/auth/guards/guest.guard';
import { AuthenticatedLayout } from './layouts/authenticated-layout/authenticated-layout/authenticated-layout';
import { NotFound } from './features/not-found/not-found';
import { organizationDetailResolver } from './features/organizations/resolvers/organization-detail-resolver';

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
        title: 'Dashboard',
        data: { breadcrumb: 'Dashboard' },
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard').then(
            (module) => module.Dashboard,
          ),
      },
      {
        path: 'organizations',
        title: 'Organizations',
        data: { breadcrumb: 'Organizations' },
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () =>
              import('./features/organizations/pages/organizations/organizations').then(
                (module) => module.Organizations,
              ),
          },
          {
            path: ':id',
            title: 'Organization details',
            resolve: {
              detail: organizationDetailResolver,
            },
            data: {
              breadcrumb: (data: Data): string => data['detail'].organization.name,
            },
            loadComponent: () =>
              import('./features/organizations/pages/organization-detail/organization-detail').then(
                (module) => module.OrganizationDetail,
              ),
          },
        ],
      },
      {
        path: 'invoices',
        title: 'Invoices',
        data: { breadcrumb: 'Invoices' },
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () =>
              import('./features/invoices/pages/invoices/invoices').then(
                (module) => module.Invoices,
              ),
          },
        ],
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

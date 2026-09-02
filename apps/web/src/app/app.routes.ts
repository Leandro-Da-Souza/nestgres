import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    title: 'Login',
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];

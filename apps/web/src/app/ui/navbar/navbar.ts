import { Component, computed, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Dropdown } from '../dropdown/dropdown';
import { Button } from '../button/button';
import { LogoutButton } from '../../features/auth/components/logout-button/logout-button';

export type NavLink = {
  path: string;
  name: string;
};

@Component({
  imports: [RouterLink, RouterLinkActive, Dropdown, LogoutButton],
  selector: 'app-navbar',
  styleUrl: './navbar.scss',
  templateUrl: './navbar.html',
})
export class Navbar {
  protected links: NavLink[] = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/users', name: 'Users' },
    { path: '/organizations', name: 'Organizations' },
    { path: '/invoices', name: 'Invoices' },
  ];

  public variant = input('primary');
  public className = computed(() => `navbar navbar__${this.variant()}`);
}

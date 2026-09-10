import { Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export type NavLink = {
  path: string;
  name: string;
};

@Component({
  imports: [RouterLink, RouterLinkActive],
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

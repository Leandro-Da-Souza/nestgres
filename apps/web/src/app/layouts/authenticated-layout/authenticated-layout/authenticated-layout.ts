import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../../ui/navbar/navbar';
import { Breadcrumbs } from '../../../ui/breadcrumbs/breadcrumbs';

@Component({
  imports: [RouterOutlet, Navbar, Breadcrumbs],
  selector: 'app-authenticated-layout',
  styleUrl: './authenticated-layout.scss',
  templateUrl: './authenticated-layout.html',
})
export class AuthenticatedLayout {}

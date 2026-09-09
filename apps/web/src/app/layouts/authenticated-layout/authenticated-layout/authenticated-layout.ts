import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../../ui/navbar/navbar';

@Component({
  imports: [RouterOutlet, Navbar],
  selector: 'app-authenticated-layout',
  styleUrl: './authenticated-layout.scss',
  templateUrl: './authenticated-layout.html',
})
export class AuthenticatedLayout {}

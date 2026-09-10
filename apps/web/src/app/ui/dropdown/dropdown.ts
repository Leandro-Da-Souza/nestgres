import { Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-dropdown',
  styleUrl: './dropdown.scss',
  templateUrl: './dropdown.html',
})
export class Dropdown {
  public isOpen = signal<boolean>(false);

  public toggleOpen() {
    this.isOpen.update((current) => !current);
  }
}

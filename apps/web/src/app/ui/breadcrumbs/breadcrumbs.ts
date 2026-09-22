import { Component, inject } from '@angular/core';
import { BreadcrumbService } from '../../core/navigation/breadcrumb.service';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-breadcrumbs',
  styleUrl: './breadcrumbs.scss',
  templateUrl: './breadcrumbs.html',
})
export class Breadcrumbs {
  private breadcrumbService = inject(BreadcrumbService);

  breadcrumbs = this.breadcrumbService.breadcrumbs;
}

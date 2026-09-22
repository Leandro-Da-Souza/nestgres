import { inject, Service, signal } from '@angular/core';
import type { Breadcrumb } from './breadcrumb.type';
import { ActivatedRouteSnapshot, Data, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Breadcrumbs } from '../../ui/breadcrumbs/breadcrumbs';

@Service()
export class BreadcrumbService {
  private readonly router = inject(Router);

  private _breadcrumbs = signal<Breadcrumb[]>([]);

  readonly breadcrumbs = this._breadcrumbs.asReadonly();

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((_event) => {
        this.updateBreadcrumbs();
      });
  }

  private updateBreadcrumbs(): void {
    const root = this.router.routerState.snapshot.root;
    const breadcrumbs: Breadcrumb[] = [];

    this.addBreadcrumb(root, [], breadcrumbs);
    this._breadcrumbs.set(breadcrumbs);
  }

  private addBreadcrumb(
    route: ActivatedRouteSnapshot | null,
    parentUrl: string[],
    breadcrumbs: Breadcrumb[],
  ): void {
    if (route) {
      const routeUrl = parentUrl.concat(route.url.map((url) => url.path));

      const breadcrumb = route.routeConfig?.data?.['breadcrumb'];

      if (breadcrumb) {
        breadcrumbs.push({
          label: typeof breadcrumb === 'function' ? breadcrumb(route.data) : breadcrumb,
          url: '/' + routeUrl.join('/'),
        });
      }

      this.addBreadcrumb(route.firstChild, routeUrl, breadcrumbs);
    }
  }
}

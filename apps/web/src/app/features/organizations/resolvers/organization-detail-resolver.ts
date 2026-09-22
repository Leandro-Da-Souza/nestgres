import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Organization, OrganizationSummary } from '@nestgres/contracts';
import { OrganizationService } from '../organization.service';
import { catchError, forkJoin, map, of } from 'rxjs';

export type OrganizationDetailData = {
  organization: Organization;
  summary: OrganizationSummary;
};

export const organizationDetailResolver: ResolveFn<OrganizationDetailData> = (route) => {
  const organizationService = inject(OrganizationService);
  const id = Number(route.paramMap.get('id'));
  const router = inject(Router);

  return forkJoin({
    organization: organizationService.getOrganizationById(id),
    summary: organizationService.getOrganizationSummary(id),
  }).pipe(
    map(({ organization, summary }) => ({
      organization: organization.data,
      summary: summary.data,
    })),
    catchError((error) => {
      console.error('Failed to load details', error);
      return of(new RedirectCommand(router.createUrlTree(['/organizations'])));
    }),
  );
};

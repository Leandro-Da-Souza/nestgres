import { ResolveFn, Router } from '@angular/router';
import { Invoice, Organization } from '@nestgres/contracts';
import { inject } from '@angular/core';
import { InvoiceService } from '../invoice.service';
import { OrganizationService } from '../../organizations/organization.service';
import { forkJoin, map, switchMap } from 'rxjs';

export type InvoiceDetailData = {
  invoice: Invoice;
  organization: Organization;
};

export const invoiceDetailResolver: ResolveFn<InvoiceDetailData> = (route, state) => {
  const invoiceService = inject(InvoiceService);
  const organizationService = inject(OrganizationService);
  const router = inject(Router);

  const id = Number(route.paramMap.get('id'));

  return invoiceService.getInvoiceById(id).pipe(
    map((invoice) => invoice.data),
    switchMap((invoice) =>
      organizationService.getOrganizationById(invoice.organizationId).pipe(
        map((response) => ({
          invoice,
          organization: response.data,
        })),
      ),
    ),
  );
};

import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import type { Organization, OrganizationSummary } from '@nestgres/contracts';
import { OrganizationDetailData } from '../../resolvers/organization-detail-resolver';
import { JsonPipe } from '@angular/common';
import { Breadcrumbs } from '../../../../ui/breadcrumbs/breadcrumbs';

@Component({
  imports: [JsonPipe],
  selector: 'app-organization-detail',
  styleUrl: './organization-detail.scss',
  templateUrl: './organization-detail.html',
})
export class OrganizationDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly data = toSignal(this.route.data, { requireSync: true });
  public readonly detail = computed(() => this.data()['detail'] as OrganizationDetailData);

  public organization = computed(() => this.detail().organization as Organization);
  public summary = computed(() => this.detail().summary as OrganizationSummary);
}

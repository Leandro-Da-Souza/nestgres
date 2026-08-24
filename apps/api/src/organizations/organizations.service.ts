import { Injectable } from '@nestjs/common';
import type { OrganizationType } from './types/organization.type';

@Injectable()
export class OrganizationsService {
  private readonly organizations: OrganizationType[] = [
    {
      id: 1,
      name: 'Null Incorporated',
      countryCode: 'SE',
      plan: 'free',
      createdAt: new Date('2024-05-06').toISOString(),
    },
  ];

  public getOrganizations(): Promise<OrganizationType[]> {
    // return this.organizations;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.organizations);
      }, 3000);
    });
  }
}

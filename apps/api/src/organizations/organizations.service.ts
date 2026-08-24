import { Inject, Injectable } from '@nestjs/common';
import type { OrganizationType } from './types/organization.type';
import { PG_POOL } from '../database/database.constants';
import { Pool } from 'pg';

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(PG_POOL)
    private readonly pool: Pool,
  ) {}

  private readonly organizations: OrganizationType[] = [
    {
      id: 1,
      name: 'Null Incorporated',
      countryCode: 'SE',
      plan: 'free',
      createdAt: new Date('2024-05-06'),
    },
  ];

  public async getOrganizations(): Promise<OrganizationType[]> {
    const query = {
      text: `
      SELECT
        id,
        name,
        plan,
        country_code AS "countryCode",
        created_at AS "createdAt"
      FROM organizations
    `,
    };

    const res = await this.pool.query<OrganizationType>(query);
    return res.rows;
  }
}

import {
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { OrganizationType } from './types/organizationType';
import { PG_POOL } from '../database/database.constants';
import { Pool } from 'pg';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(PG_POOL)
    private readonly pool: Pool,
  ) {}

  public async fetchOrganizations(): Promise<OrganizationType[]> {
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

  public async fetchOrganizationById(id: number): Promise<OrganizationType> {
    const query = {
      text: `
        SELECT
          id,
          name,
          plan,
          country_code AS "countryCode",
          created_at AS "createdAt"
        FROM organizations
        WHERE id = $1
      `,
      values: [id],
    };

    const res = await this.pool.query<OrganizationType>(query);
    const organization = res.rows[0];

    if (!organization) {
      throw new NotFoundException(`Organization ${id} not found.`);
    }

    return organization;
  }

  public async createOrganization(
    body: CreateOrganizationDto,
  ): Promise<OrganizationType> {
    const { name, plan, countryCode } = body;

    const query = {
      text: `
        INSERT INTO organizations (name, plan, country_code)
        VALUES ($1, $2, $3)
        RETURNING 
          id, 
          name, 
          plan, 
          country_code AS "countryCode", 
          created_at AS "createdAt"
      `,
      values: [name, plan, countryCode],
    };

    const res = await this.pool.query<OrganizationType>(query);
    const organization = res.rows[0];

    if (!organization) {
      throw new InternalServerErrorException(
        'Organization was created but not returned',
      );
    }

    return organization;
  }
}

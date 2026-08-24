import {
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import type { OrganizationType } from './types/organizationType';
import { PG_POOL } from '../database/database.constants';
import { Pool, QueryResultRow } from 'pg';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { DeletedOrganizationRow } from './types/deletedOrganizationRow';

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

  public async updateOrganization(
    id: number,
    changes: UpdateOrganizationDto,
  ): Promise<OrganizationType> {
    const assignments: string[] = [];
    const values: Array<string | number> = [];

    if (changes.name !== undefined) {
      values.push(changes.name);
      assignments.push(`name = $${values.length}`);
    }

    if (changes.plan !== undefined) {
      values.push(changes.plan);
      assignments.push(`plan = $${values.length}`);
    }

    if (changes.countryCode !== undefined) {
      values.push(changes.countryCode);
      assignments.push(`country_code = $${values.length}`);
    }

    if (assignments.length === 0) {
      throw new BadRequestException('No changes provided');
    }

    values.push(id);
    const idPlaceholder = `$${values.length}`;

    const query = {
      text: `
        UPDATE organizations
        SET ${assignments.join(', ')}
        WHERE id = ${idPlaceholder}
        RETURNING
            id,
            name,
            plan,
            country_code AS "countryCode",
            created_at AS "createdAt"
      `,
      values: values,
    };

    const result = await this.pool.query<OrganizationType>(query);
    const organization = result.rows[0];

    if (!organization) {
      throw new NotFoundException(`Organization ${id} not found.`);
    }

    return organization;
  }

  public async deleteOrganization(id: number): Promise<void> {
    const query = {
      text: `
        DELETE FROM organizations
        WHERE id = $1
        RETURNING id
      `,
      values: [id],
    };

    try {
      const result = await this.pool.query<DeletedOrganizationRow>(query);
      const deletedOrganization = result.rows[0];

      if (!deletedOrganization) {
        throw new NotFoundException(`Organization ${id} not found.`);
      }
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23503'
      ) {
        throw new ConflictException(
          `Organization ${id} cannot be deleted because it has related records.`,
        );
      }

      throw error;
    }
  }
}

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { OrganizationType } from './types/organizationType';
import { PG_POOL } from '../database/database.constants';
import { Pool } from 'pg';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { DeletedOrganizationRow } from './types/deletedOrganizationRow';
import { isPostgresError } from '../database/utils/is-postgres-error';
import { OrganizationUserType } from './types/organizationUserType';
import { OrganizationInvoiceType } from './types/organizationInvoiceType';
import { OrganizationSummaryType } from './types/organizationSummaryType';
import { JwtPayloadType } from '../common/types/shared.types';

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(PG_POOL)
    private readonly pool: Pool,
  ) {}

  private readonly ORG_PROJECTION = `
        id,
        name,
        plan,
        country_code AS "countryCode",
        created_at AS "createdAt"
  `;

  private ORG_UPDATE_COLUMNS = {
    name: 'name',
    plan: 'plan',
    countryCode: 'country_code',
  } as const satisfies Record<keyof UpdateOrganizationDto, string>;

  public async getOrganizations(): Promise<OrganizationType[]> {
    const query = {
      text: `
      SELECT ${this.ORG_PROJECTION}
      FROM organizations
    `,
    };

    const res = await this.pool.query<OrganizationType>(query);
    return res.rows;
  }

  public async getOrganizationById(id: number): Promise<OrganizationType> {
    const query = {
      text: `
        SELECT ${this.ORG_PROJECTION}
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
        RETURNING ${this.ORG_PROJECTION}
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

    type OrganizationUpdateKey = keyof typeof this.ORG_UPDATE_COLUMNS;

    const keys = Object.keys(
      this.ORG_UPDATE_COLUMNS,
    ) as OrganizationUpdateKey[];

    for (const key of keys) {
      const value = changes[key];

      if (value === undefined) continue;

      values.push(value);
      assignments.push(`${this.ORG_UPDATE_COLUMNS[key]} = $${values.length}`);
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
        RETURNING ${this.ORG_PROJECTION}
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
      if (isPostgresError(error)) {
        if (error.code === '23503') {
          throw new ConflictException(
            `Organization ${id} cannot be deleted because it has related records.`,
          );
        }
      }

      throw error;
    }
  }

  public async getOrganizationUsers(
    id: number,
    user: JwtPayloadType,
  ): Promise<OrganizationUserType[]> {
    const isSuperAdmin = user.role === 'super_admin';

    const organizationConstraint = !isSuperAdmin ? 'AND o.id = $2' : '';

    const values = !isSuperAdmin ? [id, user.organizationId] : [id];
    const query = {
      text: `
        SELECT 
          u.id AS "userId", 
          u.display_name AS "displayName", 
          u.role, 
          u.email, 
          o.id AS "organizationId", 
          o.name AS "organizationName"
        FROM organizations AS o 
        INNER JOIN users AS u ON o.id = u.organization_id
        WHERE o.id = $1
        ${organizationConstraint}
        ORDER BY u.display_name ASC 
      `,
      values,
    };

    const result = await this.pool.query<OrganizationUserType>(query);
    return result.rows;
  }

  public async getOrganizationInvoices(
    id: number,
    user: JwtPayloadType,
  ): Promise<OrganizationInvoiceType[]> {
    const isSuperAdmin = user.role === 'super_admin';

    const organizationConstraint = !isSuperAdmin ? `AND o.id = $2` : '';

    const values = !isSuperAdmin ? [id, user.organizationId] : [id];

    const query = {
      text: `
        SELECT
          i.id AS "invoiceId",
          o.id AS "organizationId",
          o.name AS "organizationName",
          i.amount,
          i.currency,
          i.status,
          i.issued_on,
          i.due_on,
          i.paid_at
        FROM organizations AS o 
        INNER JOIN invoices AS i on o.id = i.organization_id
        WHERE o.id = $1
        ${organizationConstraint}
        ORDER BY i.issued_on DESC
      `,
      values,
    };

    const result = await this.pool.query<OrganizationInvoiceType>(query);
    return result.rows;
  }

  public async getOrganizationSummary(
    id: number,
    user: JwtPayloadType,
  ): Promise<OrganizationSummaryType> {
    const { organizationId, role } = user;

    if (role !== 'super_admin' && id !== organizationId) {
      throw new ForbiddenException('Access to this organization is denied.');
    }

    const query = {
      text: `
        SELECT 
          o.id AS "organizationId",
          o.name AS "organizationName",
          COALESCE(us.number_of_users, 0)::int AS "numberOfUsers",
          COALESCE(ins.number_of_invoices, 0)::int AS "numberOfInvoices",
          COALESCE(ins.total_invoice_amount, 0) as "totalInvoiceAmount",
          COALESCE(ins.outstanding_amount, 0) AS "outstandingAmount"
        FROM organizations AS o
        LEFT JOIN (
          SELECT
            organization_id,
            count(*) AS "number_of_users"
          FROM users
          GROUP BY organization_id
        ) AS us
          ON us.organization_id = o.id  
        LEFT JOIN (
          SELECT 
            organization_id,
            count(*) AS "number_of_invoices",
            SUM(amount) AS "total_invoice_amount",
            SUM(amount) FILTER ( WHERE status IN ('open', 'overdue') )
                AS "outstanding_amount"
          FROM invoices
          GROUP BY organization_id
        ) AS ins
          ON ins.organization_id = o.id
        WHERE o.id = $1
      `,
      values: [id],
    };

    const result = await this.pool.query<OrganizationSummaryType>(query);
    const summary = result.rows[0];

    if (!summary) {
      throw new NotFoundException(`Organization ${id} could not be found`);
    }

    return summary;
  }

  public async getOrganizationSummaries(): Promise<OrganizationSummaryType[]> {
    const query = {
      text: `
        SELECT 
          o.id AS "organizationId",
          o.name AS "organizationName",
          COALESCE(us.number_of_users, 0)::int AS "numberOfUsers",
          COALESCE(ins.number_of_invoices, 0)::int AS "numberOfInvoices",
          COALESCE(ins.total_invoice_amount, 0) as "totalInvoiceAmount",
          COALESCE(ins.outstanding_amount, 0) AS "outstandingAmount"
        FROM organizations AS o
        LEFT JOIN (
          SELECT
            organization_id,
            count(*) AS "number_of_users"
          FROM users
          GROUP BY organization_id
        ) AS us
          ON us.organization_id = o.id  
        LEFT JOIN (
          SELECT 
            organization_id,
            count(*) AS "number_of_invoices",
            SUM(amount) AS "total_invoice_amount",
            SUM(amount) FILTER ( WHERE status IN ('open', 'overdue') )
                AS "outstanding_amount"
          FROM invoices
          GROUP BY organization_id
        ) AS ins
          ON ins.organization_id = o.id
        ORDER BY o.id
      `,
    };

    const result = await this.pool.query<OrganizationSummaryType>(query);
    const summary = result.rows;

    return summary;
  }
}

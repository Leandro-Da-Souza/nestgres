import {
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PG_POOL } from '../database/database.constants';
import { Pool } from 'pg';
import type { InvoiceType } from './types/invoiceType';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { handleInvoiceWriteError } from './utils/handle-invoice-write-error';
import { JwtPayloadType } from '../common/types/shared.types';

@Injectable()
export class InvoicesService {
  constructor(
    @Inject(PG_POOL)
    private readonly pool: Pool,
  ) {}

  private INVOICE_UPDATE_COLUMNS = {
    organizationId: 'organization_id',
    amount: 'amount',
    currency: 'currency',
    status: 'status',
    issuedOn: 'issued_on',
    dueOn: 'due_on',
    paidAt: 'paid_at',
  } as const satisfies Record<keyof UpdateInvoiceDto, string>;

  private readonly INVOICE_PROJECTION = `
    id,
    organization_id AS "organizationId",
    amount,
    currency,
    status,
    issued_on AS "issuedOn",
    due_on AS "dueOn",
    paid_at AS "paidAt",
    created_at AS "createdAt"
  `;

  public async getAllInvoices(user: JwtPayloadType): Promise<InvoiceType[]> {
    const isSuperAdmin = user.role === 'super_admin';

    const organizationConstraint = isSuperAdmin
      ? ''
      : 'WHERE organization_id = $1';

    const values = isSuperAdmin ? [] : [user.organizationId];

    const query = {
      text: `
        SELECT ${this.INVOICE_PROJECTION}
        FROM invoices
        ${organizationConstraint}
        ORDER BY id
      `,
      values,
    };

    const result = await this.pool.query<InvoiceType>(query);
    return result.rows;
  }

  public async getInvoiceById(
    id: number,
    user: JwtPayloadType,
  ): Promise<InvoiceType> {
    const isSuperAdmin = user.role === 'super_admin';

    const organizationConstraint = isSuperAdmin
      ? ''
      : 'AND organization_id = $2';

    const values: Array<number | null> = isSuperAdmin
      ? [id]
      : [id, user.organizationId];

    const query = {
      text: `
        SELECT ${this.INVOICE_PROJECTION}
        FROM invoices
        WHERE id = $1  
          ${organizationConstraint}
      `,
      values,
    };

    const result = await this.pool.query<InvoiceType>(query);
    const invoice = result.rows[0];

    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found.`);
    }

    return invoice;
  }

  public async createInvoice(
    body: CreateInvoiceDto,
    user: JwtPayloadType,
  ): Promise<InvoiceType> {
    const {
      organizationId,
      amount,
      currency,
      status,
      issuedOn,
      dueOn,
      paidAt,
    } = body;

    const isSuperAdmin = user.role === 'super_admin';

    if (!isSuperAdmin && organizationId !== user.organizationId) {
      throw new ForbiddenException(
        'Cannot create an invoice for another organization.',
      );
    }

    const query = {
      text: `
        INSERT INTO invoices (
          organization_id, 
          amount, 
          currency, 
          status, 
          issued_on, 
          due_on, 
          paid_at
        ) values ($1, $2, $3, $4, $5, $6, $7)
        RETURNING ${this.INVOICE_PROJECTION}
      `,
      values: [
        organizationId,
        amount,
        currency,
        status,
        issuedOn,
        dueOn,
        paidAt ?? null,
      ],
    };

    try {
      const result = await this.pool.query<InvoiceType>(query);
      const invoice = result.rows[0];

      if (!invoice) {
        throw new InternalServerErrorException(
          'Invoice was created but not returned.',
        );
      }

      return invoice;
    } catch (e: unknown) {
      handleInvoiceWriteError(e);
    }
  }

  public async updateInvoice(
    id: number,
    changes: UpdateInvoiceDto,
    user: JwtPayloadType,
  ): Promise<InvoiceType> {
    const isSuperAdmin = user.role === 'super_admin';

    if (
      !isSuperAdmin &&
      changes.organizationId !== undefined &&
      changes.organizationId !== user.organizationId
    ) {
      throw new ForbiddenException(
        'Cannot move an invoice to another organization.',
      );
    }
    const assignments: string[] = [];
    const values: Array<string | number | null> = [];

    type InvoiceUpdateKey = keyof typeof this.INVOICE_UPDATE_COLUMNS;

    const keys = Object.keys(this.INVOICE_UPDATE_COLUMNS) as InvoiceUpdateKey[];

    for (const key of keys) {
      const value = changes[key];

      if (value === undefined) continue;

      values.push(value);

      assignments.push(
        `${this.INVOICE_UPDATE_COLUMNS[key]} = $${values.length}`,
      );
    }

    if (assignments.length === 0) {
      throw new BadRequestException('No changes provided.');
    }

    values.push(id);
    const idPlaceholder = `$${values.length}`;

    let organizationConstraint = '';
    if (!isSuperAdmin) {
      values.push(user.organizationId);
      organizationConstraint = `AND organization_id = $${values.length}`;
    }

    const query = {
      text: `
        UPDATE invoices
        SET ${assignments.join(', ')}
        WHERE id = ${idPlaceholder}
            ${organizationConstraint}
        RETURNING ${this.INVOICE_PROJECTION}
      `,
      values: values,
    };

    try {
      const result = await this.pool.query<InvoiceType>(query);
      const invoice = result.rows[0];

      if (!invoice) {
        throw new NotFoundException(`Invoice ${id} not found`);
      }

      return invoice;
    } catch (error: unknown) {
      handleInvoiceWriteError(error);
    }
  }

  public async deleteInvoice(id: number, user: JwtPayloadType): Promise<void> {
    const isSuperAdmin = user.role === 'super_admin';

    const organizationConstraint = !isSuperAdmin
      ? 'AND organization_id = $2'
      : '';

    const values = !isSuperAdmin ? [id, user.organizationId] : [id];

    const query = {
      text: `
        DELETE FROM invoices
        WHERE id = $1
            ${organizationConstraint}
        RETURNING id
      `,
      values,
    };

    const result = await this.pool.query<{ id: number }>(query);
    const deletedInvoice = result.rows[0];

    if (!deletedInvoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }
  }

  public async getRecentInvoices(
    user: JwtPayloadType,
    limit: number = 5,
  ): Promise<InvoiceType[]> {
    const isSuperAdmin = user.role === 'super_admin';

    const organizationConstraint = !isSuperAdmin
      ? `WHERE organization_id = $2`
      : '';

    const values = !isSuperAdmin ? [limit, user.organizationId] : [limit];

    const query = {
      text: `
        SELECT ${this.INVOICE_PROJECTION}
        FROM invoices
        ${organizationConstraint}
        ORDER BY issued_on DESC, id DESC
        LIMIT $1
      `,
      values,
    };

    const result = await this.pool.query<InvoiceType>(query);
    return result.rows;
  }
}

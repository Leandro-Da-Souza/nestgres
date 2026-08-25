import {
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PG_POOL } from '../database/database.constants';
import { Pool } from 'pg';
import type { InvoiceType } from './types/invoiceType';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { isPostgresError } from '../database/utils/is-postgres-error';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @Inject(PG_POOL)
    private readonly pool: Pool,
  ) {}

  INVOICE_COLUMNS = {
    organizationId: 'organization_id',
    amount: 'amount',
    currency: 'currency',
    status: 'status',
    issuedOn: 'issued_on',
    dueOn: 'due_on',
    paidAt: 'paid_at',
  } as const;

  public async getAllInvoices(): Promise<InvoiceType[]> {
    const query = {
      text: `
        SELECT
          id,
          organization_id AS "organizationId",
          amount,
          currency,
          status,
          issued_on AS "issuedOn",
          due_on AS "dueOn",
          paid_at AS "paidAt",
          created_at AS "createdAt"
        FROM invoices
        ORDER BY id
      `,
    };

    const result = await this.pool.query<InvoiceType>(query);
    return result.rows;
  }

  public async getInvoiceById(id: number): Promise<InvoiceType> {
    const query = {
      text: `
        SELECT
          id,
          organization_id AS "organizationId",
          amount,
          currency,
          status,
          issued_on AS "issuedOn",
          due_on AS "dueOn",
          paid_at AS "paidAt",
          created_at AS "createdAt"
        FROM invoices
        WHERE id = $1
      `,
      values: [id],
    };

    const result = await this.pool.query<InvoiceType>(query);
    const invoice = result.rows[0];

    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found.`);
    }

    return invoice;
  }

  public async createInvoice(body: CreateInvoiceDto): Promise<InvoiceType> {
    const {
      organizationId,
      amount,
      currency,
      status,
      issuedOn,
      dueOn,
      paidAt,
    } = body;

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
        RETURNING
          id,
          organization_id AS "organizationId",
          amount,
          currency,
          status,
          issued_on::text AS "issuedOn",
          due_on::text AS "dueOn",
          paid_at AS "paidAt",
          created_at AS "createdAt"
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
      if (isPostgresError(e)) {
        if (e.code === '23503') {
          throw new NotFoundException(`${organizationId} not found.`);
        }

        if (e.code === '23514') {
          throw new BadRequestException(
            'Invoice dates, status, or payment date are inconsistent.',
          );
        }
      }

      throw e;
    }
  }

  public async updateInvoice(
    id: number,
    changes: UpdateInvoiceDto,
  ): Promise<InvoiceType> {
    const assignments: string[] = [];
    const values: Array<string | number | null> = [];

    type InvoiceUpdateKey = keyof typeof this.INVOICE_COLUMNS;

    const keys = Object.keys(this.INVOICE_COLUMNS) as InvoiceUpdateKey[];

    for (const key of keys) {
      const value = changes[key];

      if (value === undefined) continue;

      values.push(value);

      assignments.push(`${this.INVOICE_COLUMNS[key]} = $${values.length}`);
    }

    if (assignments.length === 0) {
      throw new BadRequestException('No changes provided.');
    }

    values.push(id);
    const idPlaceholder = `$${values.length}`;

    const query = {
      text: `
        UPDATE invoices
        SET ${assignments.join(', ')}
        WHERE id = ${idPlaceholder}
        RETURNING
          id,
          organization_id AS "organizationId",
          amount,
          currency,
          status,
          issued_on::text AS "issuedOn",
          due_on::text AS "dueOn",
          paid_at AS "paidAt",
          created_at AS "createdAt"
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
      if (isPostgresError(error)) {
        if (error.code === '23503') {
          throw new NotFoundException('Referenced organization not found.');
        }

        if (error.code === '23514') {
          throw new BadRequestException(
            'Invoice dates, status, payment details, or amount are inconsistent.',
          );
        }
      }

      throw error;
    }
  }

  public async deleteInvoice(id: number): Promise<void> {
    const query = {
      text: `
        DELETE FROM invoices
        WHERE id = $1
        RETURNING id
      `,
      values: [id],
    };

    const result = await this.pool.query<{ id: number }>(query);
    const deletedInvoice = result.rows[0];

    if (!deletedInvoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }
  }
}

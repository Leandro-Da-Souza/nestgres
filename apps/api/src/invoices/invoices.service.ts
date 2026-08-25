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

@Injectable()
export class InvoicesService {
  constructor(
    @Inject(PG_POOL)
    private readonly pool: Pool,
  ) {}

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
}

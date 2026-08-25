import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PG_POOL } from '../database/database.constants';
import { Pool } from 'pg';
import type { InvoiceType } from './types/invoiceType';

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
}

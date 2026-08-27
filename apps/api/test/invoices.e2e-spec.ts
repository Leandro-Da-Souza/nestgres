import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createE2eApp } from './create-e2e-app';

describe('Invoices (e2e)', () => {
  let app: INestApplication<App>;
  let organizationId: number | undefined;
  let invoiceId: number | undefined;
  const organizationName = `e2e-invoice-organization-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    if (invoiceId !== undefined) {
      await request(app.getHttpServer()).delete(`/invoices/${invoiceId}`);
    }
    if (organizationId !== undefined) {
      await request(app.getHttpServer()).delete(
        `/organizations/${organizationId}`,
      );
    }
    await app.close();
  });

  it('creates, reads, updates, lists, and deletes an invoice', async () => {
    const organization = await request(app.getHttpServer())
      .post('/organizations')
      .send({ name: organizationName, plan: 'free', countryCode: 'SE' })
      .expect(201);
    organizationId = organization.body.id as number;

    const created = await request(app.getHttpServer())
      .post('/invoices')
      .send({
        organizationId,
        amount: 125.5,
        currency: 'SEK',
        status: 'open',
        issuedOn: '2026-01-01',
        dueOn: '2026-01-31',
      })
      .expect(201);

    invoiceId = created.body.id as number;
    expect(created.body).toMatchObject({
      id: invoiceId,
      organizationId,
      amount: '125.50',
      currency: 'SEK',
      status: 'open',
      issuedOn: '2025-12-31T23:00:00.000Z',
      dueOn: '2026-01-30T23:00:00.000Z',
      paidAt: null,
    });

    await request(app.getHttpServer())
      .get(`/invoices/${invoiceId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({ id: invoiceId, organizationId });
      });

    await request(app.getHttpServer())
      .patch(`/invoices/${invoiceId}`)
      .send({ status: 'paid', paidAt: '2026-01-15T12:00:00.000Z' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: invoiceId,
          status: 'paid',
          paidAt: '2026-01-15T12:00:00.000Z',
        });
      });

    await request(app.getHttpServer())
      .get('/invoices')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.arrayContaining([expect.objectContaining({ id: invoiceId })]),
        );
      });

    await request(app.getHttpServer())
      .delete(`/invoices/${invoiceId}`)
      .expect(204);
    invoiceId = undefined;

    await request(app.getHttpServer())
      .get(`/invoices/${created.body.id as number}`)
      .expect(404);
  });
});

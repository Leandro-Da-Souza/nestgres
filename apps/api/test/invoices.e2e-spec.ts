/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createE2eApp } from './create-e2e-app';
import { authorizationHeader, createE2eAccessToken } from './e2e-auth';

describe('Invoices (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let organizationId: number | undefined;
  let invoiceId: number | undefined;
  const organizationName = `e2e-invoice-organization-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  beforeAll(async () => {
    app = await createE2eApp();
    accessToken = await createE2eAccessToken(app);
  });

  afterAll(async () => {
    if (invoiceId !== undefined) {
      await request(app.getHttpServer())
        .delete(`/invoices/${invoiceId}`)
        .set(authorizationHeader(accessToken));
    }
    if (organizationId !== undefined) {
      await request(app.getHttpServer())
        .delete(`/organizations/${organizationId}`)
        .set(authorizationHeader(accessToken));
    }
    await app.close();
  });

  it('creates, reads, updates, lists, and deletes an invoice', async () => {
    const organization = await request(app.getHttpServer())
      .post('/organizations')
      .set(authorizationHeader(accessToken))
      .send({ name: organizationName, plan: 'free', countryCode: 'SE' })
      .expect(201);
    organizationId = organization.body.data.id as number;
    const organizationAdminToken = await createE2eAccessToken(
      app,
      organizationId,
      'admin',
    );
    const memberToken = await createE2eAccessToken(
      app,
      organizationId,
      'member',
    );

    const created = await request(app.getHttpServer())
      .post('/invoices')
      .set(authorizationHeader(organizationAdminToken))
      .send({
        organizationId,
        amount: 125.5,
        currency: 'SEK',
        status: 'open',
        issuedOn: '2026-01-01',
        dueOn: '2026-01-31',
      })
      .expect(201);

    invoiceId = created.body.data.id as number;
    expect(created.body).toMatchObject({
      data: {
        id: invoiceId,
        organizationId,
        amount: '125.50',
        currency: 'SEK',
        status: 'open',
        issuedOn: '2025-12-31T23:00:00.000Z',
        dueOn: '2026-01-30T23:00:00.000Z',
        paidAt: null,
      },
      meta: {
        timestamp: expect.any(String),
        durationMs: expect.any(Number),
        path: '/invoices',
        method: 'POST',
      },
    });

    await request(app.getHttpServer())
      .get(`/invoices/${invoiceId}`)
      .set(authorizationHeader(accessToken))
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toMatchObject({ id: invoiceId, organizationId });
      });

    await request(app.getHttpServer())
      .patch(`/invoices/${invoiceId}`)
      .set(authorizationHeader(organizationAdminToken))
      .send({ status: 'paid', paidAt: '2026-01-15T12:00:00.000Z' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toMatchObject({
          id: invoiceId,
          status: 'paid',
          paidAt: '2026-01-15T12:00:00.000Z',
        });
      });

    await request(app.getHttpServer())
      .post('/invoices')
      .set(authorizationHeader(memberToken))
      .send({
        organizationId,
        amount: 10,
        currency: 'SEK',
        status: 'open',
        issuedOn: '2026-02-01',
        dueOn: '2026-02-28',
      })
      .expect(403);

    await request(app.getHttpServer())
      .get('/invoices')
      .set(authorizationHeader(accessToken))
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toEqual(
          expect.arrayContaining([expect.objectContaining({ id: invoiceId })]),
        );
      });

    await request(app.getHttpServer())
      .delete(`/invoices/${invoiceId}`)
      .set(authorizationHeader(organizationAdminToken))
      .expect(204);
    invoiceId = undefined;

    await request(app.getHttpServer())
      .get(`/invoices/${created.body.data.id as number}`)
      .set(authorizationHeader(accessToken))
      .expect(404);
  });
});

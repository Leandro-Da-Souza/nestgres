/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createE2eApp } from './create-e2e-app';
import { authorizationHeader, createE2eAccessToken } from './e2e-auth';

describe('Invoices (e2e)', () => {
  let app: INestApplication<App>;
  let superAdminToken: string;
  let organizationId: number | undefined;
  let otherOrganizationId: number | undefined;
  let userId: number | undefined;
  let otherUserId: number | undefined;
  let invoiceId: number | undefined;
  let otherInvoiceId: number | undefined;

  beforeAll(async () => {
    app = await createE2eApp();
    superAdminToken = await createE2eAccessToken(app);
  });

  afterAll(async () => {
    for (const id of [invoiceId, otherInvoiceId]) {
      if (id !== undefined)
        await request(app.getHttpServer())
          .delete(`/invoices/${id}`)
          .set(authorizationHeader(superAdminToken));
    }
    for (const id of [userId, otherUserId]) {
      if (id !== undefined)
        await request(app.getHttpServer())
          .delete(`/users/${id}`)
          .set(authorizationHeader(superAdminToken));
    }
    for (const id of [organizationId, otherOrganizationId]) {
      if (id !== undefined)
        await request(app.getHttpServer())
          .delete(`/organizations/${id}`)
          .set(authorizationHeader(superAdminToken));
    }
    await app.close();
  });

  it('isolates invoice reads and writes between populated organizations', async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const firstOrganization = await request(app.getHttpServer())
      .post('/organizations')
      .set(authorizationHeader(superAdminToken))
      .send({
        name: `e2e-invoice-a-${suffix}`,
        plan: 'free',
        countryCode: 'SE',
      })
      .expect(201);
    organizationId = firstOrganization.body.data.id as number;
    const secondOrganization = await request(app.getHttpServer())
      .post('/organizations')
      .set(authorizationHeader(superAdminToken))
      .send({
        name: `e2e-invoice-b-${suffix}`,
        plan: 'free',
        countryCode: 'SE',
      })
      .expect(201);
    otherOrganizationId = secondOrganization.body.data.id as number;

    const firstUser = await request(app.getHttpServer())
      .post('/users')
      .set(authorizationHeader(superAdminToken))
      .send({
        organizationId,
        email: `e2e-invoice-a-${suffix}@example.test`,
        displayName: 'Invoice A User',
        role: 'member',
      })
      .expect(201);
    userId = firstUser.body.data.id as number;
    const secondUser = await request(app.getHttpServer())
      .post('/users')
      .set(authorizationHeader(superAdminToken))
      .send({
        organizationId: otherOrganizationId,
        email: `e2e-invoice-b-${suffix}@example.test`,
        displayName: 'Invoice B User',
        role: 'member',
      })
      .expect(201);
    otherUserId = secondUser.body.data.id as number;

    const adminToken = await createE2eAccessToken(app, organizationId, 'admin');
    const otherAdminToken = await createE2eAccessToken(
      app,
      otherOrganizationId,
      'admin',
    );
    const memberToken = await createE2eAccessToken(
      app,
      organizationId,
      'member',
    );
    const nullOrganizationAdminToken = await createE2eAccessToken(
      app,
      null,
      'admin',
    );

    const created = await request(app.getHttpServer())
      .post('/invoices')
      .set(authorizationHeader(adminToken))
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
    expect(created.body.data).toMatchObject({
      id: invoiceId,
      organizationId,
      amount: '125.50',
      issuedOn: '2026-01-01',
      dueOn: '2026-01-31',
      paidAt: null,
      createdAt: expect.any(String),
    });

    const otherCreated = await request(app.getHttpServer())
      .post('/invoices')
      .set(authorizationHeader(otherAdminToken))
      .send({
        organizationId: otherOrganizationId,
        amount: 200,
        currency: 'EUR',
        status: 'open',
        issuedOn: '2026-02-01',
        dueOn: '2026-02-28',
      })
      .expect(201);
    otherInvoiceId = otherCreated.body.data.id as number;

    await request(app.getHttpServer())
      .get('/invoices')
      .set(authorizationHeader(adminToken))
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: invoiceId,
              issuedOn: '2026-01-01',
              dueOn: '2026-01-31',
            }),
          ]),
        );
        expect(body.data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: otherInvoiceId }),
          ]),
        );
      });
    await request(app.getHttpServer())
      .get(`/invoices/${otherInvoiceId}`)
      .set(authorizationHeader(adminToken))
      .expect(404);
    await request(app.getHttpServer())
      .get('/invoices')
      .set(authorizationHeader(memberToken))
      .expect(403);
    await request(app.getHttpServer())
      .get('/invoices')
      .set(authorizationHeader(nullOrganizationAdminToken))
      .expect(200)
      .expect(({ body }) => expect(body.data).toEqual([]));

    await request(app.getHttpServer())
      .post('/invoices')
      .set(authorizationHeader(adminToken))
      .send({
        organizationId: otherOrganizationId,
        amount: 1,
        currency: 'SEK',
        status: 'open',
        issuedOn: '2026-03-01',
        dueOn: '2026-03-31',
      })
      .expect(403);
    await request(app.getHttpServer())
      .patch(`/invoices/${otherInvoiceId}`)
      .set(authorizationHeader(adminToken))
      .send({ amount: 999 })
      .expect(404);
    await request(app.getHttpServer())
      .delete(`/invoices/${otherInvoiceId}`)
      .set(authorizationHeader(adminToken))
      .expect(404);
    await request(app.getHttpServer())
      .patch(`/invoices/${invoiceId}`)
      .set(authorizationHeader(adminToken))
      .send({ organizationId: otherOrganizationId })
      .expect(403);

    await request(app.getHttpServer())
      .get(`/invoices/${otherInvoiceId}`)
      .set(authorizationHeader(superAdminToken))
      .expect(200)
      .expect(({ body }) =>
        expect(body.data).toMatchObject({
          id: otherInvoiceId,
          organizationId: otherOrganizationId,
          amount: '200.00',
        }),
      );
    await request(app.getHttpServer())
      .get(`/invoices/${invoiceId}`)
      .set(authorizationHeader(superAdminToken))
      .expect(200)
      .expect(({ body }) =>
        expect(body.data).toMatchObject({
          id: invoiceId,
          organizationId,
          amount: '125.50',
        }),
      );

    await request(app.getHttpServer())
      .patch(`/invoices/${invoiceId}`)
      .set(authorizationHeader(adminToken))
      .send({ status: 'paid', paidAt: '2026-01-15T12:00:00.000Z' })
      .expect(200)
      .expect(({ body }) =>
        expect(body.data).toMatchObject({
          status: 'paid',
          issuedOn: '2026-01-01',
          dueOn: '2026-01-31',
          paidAt: '2026-01-15T12:00:00.000Z',
        }),
      );
  });
});

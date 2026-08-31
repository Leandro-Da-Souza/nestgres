/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createE2eApp } from './create-e2e-app';
import { authorizationHeader, createE2eAccessToken } from './e2e-auth';

describe('Organizations (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let organizationId: number | undefined;
  let otherOrganizationId: number | undefined;
  let emptyOrganizationId: number | undefined;
  let userId: number | undefined;
  const invoiceIds: number[] = [];
  const name = `e2e-organization-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  beforeAll(async () => {
    app = await createE2eApp();
    accessToken = await createE2eAccessToken(app);
  });
  afterAll(async () => {
    for (const invoiceId of invoiceIds)
      await request(app.getHttpServer())
        .delete(`/invoices/${invoiceId}`)
        .set(authorizationHeader(accessToken));
    if (userId !== undefined)
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set(authorizationHeader(accessToken));
    for (const id of [organizationId, otherOrganizationId, emptyOrganizationId])
      if (id !== undefined)
        await request(app.getHttpServer())
          .delete(`/organizations/${id}`)
          .set(authorizationHeader(accessToken));
    await app.close();
  });

  it('creates, reads, updates, lists, and summarizes organizations', async () => {
    const created = await request(app.getHttpServer())
      .post('/organizations')
      .set(authorizationHeader(accessToken))
      .send({ name, plan: 'free', countryCode: 'SE' })
      .expect(201);
    organizationId = created.body.data.id as number;
    const other = await request(app.getHttpServer())
      .post('/organizations')
      .set(authorizationHeader(accessToken))
      .send({ name: `${name}-other`, plan: 'free', countryCode: 'SE' })
      .expect(201);
    otherOrganizationId = other.body.data.id as number;
    const empty = await request(app.getHttpServer())
      .post('/organizations')
      .set(authorizationHeader(accessToken))
      .send({ name: `${name}-empty`, plan: 'free', countryCode: 'SE' })
      .expect(201);
    emptyOrganizationId = empty.body.data.id as number;
    const adminToken = await createE2eAccessToken(app, organizationId, 'admin');
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

    expect(created.body).toMatchObject({
      data: { id: organizationId, name, plan: 'free', countryCode: 'SE' },
      meta: {
        timestamp: expect.any(String),
        durationMs: expect.any(Number),
        path: '/organizations',
        method: 'POST',
      },
    });
    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}`)
      .set(authorizationHeader(adminToken))
      .expect(200)
      .expect(({ body }) =>
        expect(body.data).toMatchObject({ id: organizationId, name }),
      );
    await request(app.getHttpServer())
      .get(`/organizations/${otherOrganizationId}`)
      .set(authorizationHeader(adminToken))
      .expect(404);
    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}`)
      .set(authorizationHeader(memberToken))
      .expect(403);
    await request(app.getHttpServer())
      .get('/organizations')
      .set(authorizationHeader(nullOrganizationAdminToken))
      .expect(200)
      .expect(({ body }) => expect(body.data).toEqual([]));
    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}`)
      .set(authorizationHeader(nullOrganizationAdminToken))
      .expect(404);
    await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}`)
      .set(authorizationHeader(accessToken))
      .send({ plan: 'pro' })
      .expect(200)
      .expect(({ body }) =>
        expect(body.data).toMatchObject({ id: organizationId, plan: 'pro' }),
      );
    await request(app.getHttpServer())
      .get('/organizations')
      .set(authorizationHeader(adminToken))
      .expect(200)
      .expect(({ body }) =>
        expect(body.data).toEqual([
          expect.objectContaining({ id: organizationId }),
        ]),
      );

    const user = await request(app.getHttpServer())
      .post('/users')
      .set(authorizationHeader(accessToken))
      .send({
        organizationId,
        email: `e2e-organization-user-${Date.now()}@example.test`,
        displayName: 'Organization E2E User',
        role: 'admin',
      })
      .expect(201);
    userId = user.body.data.id as number;
    for (const fixture of [
      {
        organizationId,
        amount: 125.5,
        currency: 'SEK',
        status: 'open',
        issuedOn: '2026-02-01',
        dueOn: '2026-02-28',
      },
      {
        organizationId,
        amount: 74.5,
        currency: 'SEK',
        status: 'paid',
        issuedOn: '2026-02-02',
        dueOn: '2026-02-28',
        paidAt: '2026-02-03',
      },
      {
        organizationId,
        amount: 50.25,
        currency: 'EUR',
        status: 'overdue',
        issuedOn: '2026-02-03',
        dueOn: '2026-02-28',
      },
      {
        organizationId: otherOrganizationId,
        amount: 300,
        currency: 'USD',
        status: 'open',
        issuedOn: '2026-02-04',
        dueOn: '2026-02-28',
      },
    ]) {
      const invoice = await request(app.getHttpServer())
        .post('/invoices')
        .set(authorizationHeader(accessToken))
        .send(fixture)
        .expect(201);
      invoiceIds.push(invoice.body.data.id as number);
    }

    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/users`)
      .set(authorizationHeader(adminToken))
      .expect(200)
      .expect(({ body }) =>
        expect(body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              userId,
              organizationId,
              organizationName: name,
              displayName: 'Organization E2E User',
              role: 'admin',
            }),
          ]),
        ),
      );
    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/users`)
      .set(authorizationHeader(memberToken))
      .expect(403);
    await request(app.getHttpServer())
      .get(`/organizations/${otherOrganizationId}/users`)
      .set(authorizationHeader(adminToken))
      .expect(200)
      .expect(({ body }) => expect(body.data).toEqual([]));
    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/invoices`)
      .set(authorizationHeader(adminToken))
      .expect(200)
      .expect(({ body }) =>
        expect(body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              invoiceId: invoiceIds[0],
              organizationId,
              organizationName: name,
              amount: '125.50',
              currency: 'SEK',
              status: 'open',
            }),
          ]),
        ),
      );
    await request(app.getHttpServer())
      .get(`/organizations/${otherOrganizationId}/invoices`)
      .set(authorizationHeader(adminToken))
      .expect(200)
      .expect(({ body }) => expect(body.data).toEqual([]));

    const ownAmounts = [
      {
        currency: 'EUR',
        totalInvoiceAmount: '50.25',
        totalOutstandingAmount: '50.25',
      },
      {
        currency: 'SEK',
        totalInvoiceAmount: '200.00',
        totalOutstandingAmount: '125.50',
      },
    ];
    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/summary`)
      .set(authorizationHeader(adminToken))
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toEqual({
          organizationId,
          organizationName: name,
          numberOfUsers: 1,
          numberOfInvoices: 3,
          amountsByCurrency: ownAmounts,
        });
        expect(body.data.totalInvoiceAmount).toBeUndefined();
        expect(body.data.outstandingAmount).toBeUndefined();
        for (const amount of body.data.amountsByCurrency) {
          expect(typeof amount.totalInvoiceAmount).toBe('string');
          expect(typeof amount.totalOutstandingAmount).toBe('string');
        }
      });
    await request(app.getHttpServer())
      .get(`/organizations/${otherOrganizationId}/summary`)
      .set(authorizationHeader(adminToken))
      .expect(403);
    await request(app.getHttpServer())
      .get(`/organizations/${emptyOrganizationId}/summary`)
      .set(authorizationHeader(accessToken))
      .expect(200)
      .expect(({ body }) =>
        expect(body.data).toEqual({
          organizationId: emptyOrganizationId,
          organizationName: `${name}-empty`,
          numberOfUsers: 0,
          numberOfInvoices: 0,
          amountsByCurrency: [],
        }),
      );
    await request(app.getHttpServer())
      .get(`/organizations/${otherOrganizationId}/summary`)
      .set(authorizationHeader(accessToken))
      .expect(200)
      .expect(({ body }) =>
        expect(body.data).toEqual({
          organizationId: otherOrganizationId,
          organizationName: `${name}-other`,
          numberOfUsers: 0,
          numberOfInvoices: 1,
          amountsByCurrency: [
            {
              currency: 'USD',
              totalInvoiceAmount: '300.00',
              totalOutstandingAmount: '300.00',
            },
          ],
        }),
      );
    await request(app.getHttpServer())
      .get('/organizations/999999999/summary')
      .set(authorizationHeader(accessToken))
      .expect(404);
  });
});

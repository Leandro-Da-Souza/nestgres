/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createE2eApp } from './create-e2e-app';
import { authorizationHeader, createE2eAccessToken } from './e2e-auth';

describe('Dashboard (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let organizationId: number | undefined;
  let userId: number | undefined;
  let invoiceId: number | undefined;
  const name = `e2e-dashboard-organization-${Date.now()}-${Math.random().toString(36).slice(2)}`;

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
    if (userId !== undefined) {
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set(authorizationHeader(accessToken));
    }
    if (organizationId !== undefined) {
      await request(app.getHttpServer())
        .delete(`/organizations/${organizationId}`)
        .set(authorizationHeader(accessToken));
    }
    await app.close();
  });

  it('returns aggregate totals, organization summaries, and recent invoices', async () => {
    const organization = await request(app.getHttpServer())
      .post('/organizations')
      .set(authorizationHeader(accessToken))
      .send({ name, plan: 'pro', countryCode: 'SE' })
      .expect(201);
    organizationId = organization.body.data.id as number;

    const user = await request(app.getHttpServer())
      .post('/users')
      .set(authorizationHeader(accessToken))
      .send({
        organizationId,
        email: `e2e-dashboard-user-${Date.now()}@example.test`,
        displayName: 'Dashboard E2E User',
        role: 'member',
      })
      .expect(201);
    userId = user.body.data.id as number;

    const invoice = await request(app.getHttpServer())
      .post('/invoices')
      .set(authorizationHeader(accessToken))
      .send({
        organizationId,
        amount: 225.75,
        currency: 'SEK',
        status: 'overdue',
        issuedOn: '2099-12-31',
        dueOn: '2100-01-31',
      })
      .expect(201);
    invoiceId = invoice.body.data.id as number;

    const memberToken = await createE2eAccessToken(
      app,
      organizationId,
      'member',
    );
    const adminToken = await createE2eAccessToken(app, organizationId, 'admin');

    await request(app.getHttpServer())
      .get('/dashboard')
      .set(authorizationHeader(memberToken))
      .expect(403);

    await request(app.getHttpServer())
      .get('/dashboard')
      .set(authorizationHeader(adminToken))
      .expect(403);

    await request(app.getHttpServer())
      .get('/dashboard')
      .set(authorizationHeader(accessToken))
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toEqual(
          expect.objectContaining({
            timestamp: expect.any(String),
            durationMs: expect.any(Number),
            path: '/dashboard',
            method: 'GET',
          }),
        );
        expect(body.data.totals).toEqual(
          expect.objectContaining({
            organizations: expect.any(Number),
            invoices: expect.any(Number),
            activeUsers: expect.any(Number),
            totalInvoiceAmount: expect.any(String),
            outstandingAmount: expect.any(String),
          }),
        );
        expect(body.data.totals.organizations).toBeGreaterThanOrEqual(1);
        expect(body.data.totals.invoices).toBeGreaterThanOrEqual(1);
        expect(body.data.totals.activeUsers).toBeGreaterThanOrEqual(1);

        expect(body.data.organizations).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              organizationId,
              organizationName: name,
              numberOfUsers: 1,
              numberOfInvoices: 1,
              totalInvoiceAmount: '225.75',
              outstandingAmount: '225.75',
            }),
          ]),
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(body.data.recentInvoices).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: invoiceId,
              organizationId,
              amount: '225.75',
              currency: 'SEK',
              status: 'overdue',
            }),
          ]),
        );
      });
  });
});

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
  let userId: number | undefined;
  let invoiceId: number | undefined;
  const name = `e2e-organization-${Date.now()}-${Math.random().toString(36).slice(2)}`;

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

  it('creates, reads, updates, lists, and deletes an organization', async () => {
    const created = await request(app.getHttpServer())
      .post('/organizations')
      .set(authorizationHeader(accessToken))
      .send({ name, plan: 'free', countryCode: 'SE' })
      .expect(201);

    organizationId = created.body.data.id as number;
    expect(created.body).toMatchObject({
      data: {
        id: organizationId,
        name,
        plan: 'free',
        countryCode: 'SE',
      },
      meta: {
        timestamp: expect.any(String),
        durationMs: expect.any(Number),
        path: '/organizations',
        method: 'POST',
      },
    });

    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}`)
      .set(authorizationHeader(accessToken))
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toMatchObject({ id: organizationId, name });
      });

    await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}`)
      .set(authorizationHeader(accessToken))
      .send({ plan: 'pro' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toMatchObject({ id: organizationId, plan: 'pro' });
      });

    await request(app.getHttpServer())
      .get('/organizations')
      .set(authorizationHeader(accessToken))
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: organizationId }),
          ]),
        );
      });

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

    const invoice = await request(app.getHttpServer())
      .post('/invoices')
      .set(authorizationHeader(accessToken))
      .send({
        organizationId,
        amount: 125.5,
        currency: 'SEK',
        status: 'open',
        issuedOn: '2026-02-01',
        dueOn: '2026-02-28',
      })
      .expect(201);
    invoiceId = invoice.body.data.id as number;

    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/users`)
      .set(authorizationHeader(accessToken))
      .expect(200)
      .expect(({ body }) => {
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
        );
      });

    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/invoices`)
      .set(authorizationHeader(accessToken))
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              invoiceId,
              organizationId,
              organizationName: name,
              amount: '125.50',
              currency: 'SEK',
              status: 'open',
            }),
          ]),
        );
      });

    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/summary`)
      .set(authorizationHeader(await createE2eAccessToken(app, organizationId)))
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toMatchObject({
          organizationId,
          organizationName: name,
          numberOfUsers: 1,
          numberOfInvoices: 1,
          totalInvoiceAmount: '125.50',
          outstandingAmount: '125.50',
        });
      });

    await request(app.getHttpServer())
      .delete(`/invoices/${invoiceId}`)
      .set(authorizationHeader(accessToken))
      .expect(204);
    invoiceId = undefined;
    await request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .set(authorizationHeader(accessToken))
      .expect(204);
    userId = undefined;
    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}`)
      .set(authorizationHeader(accessToken))
      .expect(204);
    organizationId = undefined;

    await request(app.getHttpServer())
      .get(`/organizations/${created.body.data.id as number}`)
      .set(authorizationHeader(accessToken))
      .expect(404);
  });
});

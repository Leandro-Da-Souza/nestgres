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
  let emptyOrganizationId: number | undefined;
  let userId: number | undefined;
  const invoiceIds: number[] = [];
  const name = `e2e-dashboard-organization-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  function addAmounts(left: string, right: string): string {
    const [a, af = ''] = left.split('.');
    const [b, bf = ''] = right.split('.');
    const n = Math.max(af.length, bf.length);
    const scale = 10 ** n;
    const total =
      Number(a) * scale +
      Number(af.padEnd(n, '0') || '0') +
      Number(b) * scale +
      Number(bf.padEnd(n, '0') || '0');
    return n === 0
      ? String(total)
      : String(Math.floor(total / scale)) +
          '.' +
          String(total % scale).padStart(n, '0');
  }

  function expectedTotals(
    current: Array<{
      currency: string;
      totalInvoiceAmount: string;
      totalOutstandingAmount: string;
    }>,
  ) {
    const increments = {
      EUR: ['151.00', '50.75'],
      SEK: ['225.75', '0'],
    } as const;
    return ['EUR', 'SEK', 'USD'].flatMap((currency) => {
      const old = current.find((value) => value.currency === currency);
      const increment = increments[currency as keyof typeof increments];
      if (!old && !increment) return [];
      return [
        {
          currency,
          totalInvoiceAmount: increment
            ? addAmounts(old?.totalInvoiceAmount ?? '0', increment[0])
            : old!.totalInvoiceAmount,
          totalOutstandingAmount: increment
            ? addAmounts(old?.totalOutstandingAmount ?? '0', increment[1])
            : old!.totalOutstandingAmount,
        },
      ];
    });
  }

  beforeAll(async () => {
    app = await createE2eApp();
    accessToken = await createE2eAccessToken(app);
  });

  afterAll(async () => {
    for (const invoiceId of invoiceIds) {
      await request(app.getHttpServer())
        .delete(`/invoices/${invoiceId}`)
        .set(authorizationHeader(accessToken));
    }
    if (userId !== undefined) {
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set(authorizationHeader(accessToken));
    }
    for (const id of [organizationId, emptyOrganizationId]) {
      if (id !== undefined) {
        await request(app.getHttpServer())
          .delete(`/organizations/${id}`)
          .set(authorizationHeader(accessToken));
      }
    }
    await app.close();
  });

  it('returns aggregate totals, organization summaries, and recent invoices', async () => {
    const dashboardBeforeFixtures = await request(app.getHttpServer())
      .get('/dashboard')
      .set(authorizationHeader(accessToken))
      .expect(200);

    const organization = await request(app.getHttpServer())
      .post('/organizations')
      .set(authorizationHeader(accessToken))
      .send({ name, plan: 'pro', countryCode: 'SE' })
      .expect(201);
    organizationId = organization.body.data.id as number;

    const emptyOrganization = await request(app.getHttpServer())
      .post('/organizations')
      .set(authorizationHeader(accessToken))
      .send({ name: `${name}-empty`, plan: 'free', countryCode: 'SE' })
      .expect(201);
    emptyOrganizationId = emptyOrganization.body.data.id as number;

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

    for (const fixture of [
      {
        amount: 100.25,
        currency: 'EUR',
        status: 'paid',
        issuedOn: '2099-12-29',
        dueOn: '2100-01-29',
        paidAt: '2099-12-30',
      },
      {
        amount: 50.75,
        currency: 'EUR',
        status: 'overdue',
        issuedOn: '2099-12-30',
        dueOn: '2100-01-30',
      },
      {
        amount: 225.75,
        currency: 'SEK',
        status: 'paid',
        issuedOn: '2099-12-31',
        dueOn: '2100-01-31',
        paidAt: '2100-01-01',
      },
    ]) {
      const invoice = await request(app.getHttpServer())
        .post('/invoices')
        .set(authorizationHeader(accessToken))
        .send({ organizationId, ...fixture })
        .expect(201);
      invoiceIds.push(invoice.body.data.id as number);
    }

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
            amountsByCurrency: expectedTotals(
              dashboardBeforeFixtures.body.data.totals.amountsByCurrency,
            ),
          }),
        );
        expect(body.data.organizations).toEqual(
          expect.arrayContaining([
            {
              organizationId,
              organizationName: name,
              numberOfUsers: 1,
              numberOfInvoices: 3,
              amountsByCurrency: [
                {
                  currency: 'EUR',
                  totalInvoiceAmount: '151.00',
                  totalOutstandingAmount: '50.75',
                },
                {
                  currency: 'SEK',
                  totalInvoiceAmount: '225.75',
                  totalOutstandingAmount: '0',
                },
              ],
            },
            {
              organizationId: emptyOrganizationId,
              organizationName: `${name}-empty`,
              numberOfUsers: 0,
              numberOfInvoices: 0,
              amountsByCurrency: [],
            },
          ]),
        );
        expect(body.data.recentInvoices).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: invoiceIds[2],
              organizationId,
              amount: '225.75',
              currency: 'SEK',
              status: 'paid',
            }),
          ]),
        );
      });
  });
});

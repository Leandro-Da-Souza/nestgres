/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createE2eApp } from './create-e2e-app';
import { authorizationHeader, createE2eAccessToken } from './e2e-auth';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let userId: number | undefined;
  let organizationId: number | undefined;
  let otherOrganizationId: number | undefined;
  let otherUserId: number | undefined;
  const email = `e2e-user-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;

  beforeAll(async () => {
    app = await createE2eApp();
    accessToken = await createE2eAccessToken(app);
  });

  afterAll(async () => {
    if (otherUserId !== undefined) {
      await request(app.getHttpServer())
        .delete(`/users/${otherUserId}`)
        .set(authorizationHeader(accessToken));
    }
    if (userId !== undefined) {
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set(authorizationHeader(accessToken));
    }
    if (otherOrganizationId !== undefined) {
      await request(app.getHttpServer())
        .delete(`/organizations/${otherOrganizationId}`)
        .set(authorizationHeader(accessToken));
    }
    if (organizationId !== undefined) {
      await request(app.getHttpServer())
        .delete(`/organizations/${organizationId}`)
        .set(authorizationHeader(accessToken));
    }
    await app.close();
  });

  it('enforces user roles and tenant-scoped reads', async () => {
    const organization = await request(app.getHttpServer())
      .post('/organizations')
      .set(authorizationHeader(accessToken))
      .send({
        name: `e2e-user-organization-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        plan: 'free',
        countryCode: 'SE',
      })
      .expect(201);
    organizationId = organization.body.data.id as number;

    const otherOrganization = await request(app.getHttpServer())
      .post('/organizations')
      .set(authorizationHeader(accessToken))
      .send({
        name: `e2e-other-user-organization-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        plan: 'free',
        countryCode: 'SE',
      })
      .expect(201);
    otherOrganizationId = otherOrganization.body.data.id as number;

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
      .post('/users')
      .set(authorizationHeader(accessToken))
      .send({
        organizationId,
        email,
        displayName: 'E2E User',
        role: 'member',
      })
      .expect(201);

    userId = created.body.data.id as number;
    expect(created.body).toMatchObject({
      data: {
        id: userId,
        organizationId,
        email,
        displayName: 'E2E User',
        role: 'member',
      },
      meta: {
        timestamp: expect.any(String),
        durationMs: expect.any(Number),
        path: '/users',
        method: 'POST',
      },
    });

    const otherUser = await request(app.getHttpServer())
      .post('/users')
      .set(authorizationHeader(accessToken))
      .send({
        organizationId: otherOrganizationId,
        email: `e2e-other-user-${Date.now()}@example.test`,
        displayName: 'Other Organization User',
        role: 'member',
      })
      .expect(201);
    otherUserId = otherUser.body.data.id as number;

    await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set(authorizationHeader(organizationAdminToken))
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toMatchObject({ id: userId, email });
      });

    await request(app.getHttpServer())
      .get(`/users/${otherUserId}`)
      .set(authorizationHeader(organizationAdminToken))
      .expect(404);

    await request(app.getHttpServer())
      .get('/users')
      .set(authorizationHeader(organizationAdminToken))
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toEqual(
          expect.arrayContaining([expect.objectContaining({ id: userId })]),
        );
        expect(body.data).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: otherUserId }),
          ]),
        );
      });

    await request(app.getHttpServer())
      .get('/users')
      .set(authorizationHeader(memberToken))
      .expect(403);

    await request(app.getHttpServer())
      .post('/users')
      .set(authorizationHeader(organizationAdminToken))
      .send({
        organizationId,
        email: `e2e-admin-denied-${Date.now()}@example.test`,
        displayName: 'Denied Admin User',
        role: 'member',
      })
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .set(authorizationHeader(organizationAdminToken))
      .send({ active: false })
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .set(authorizationHeader(accessToken))
      .send({ displayName: 'Updated E2E User', active: false })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toMatchObject({
          id: userId,
          displayName: 'Updated E2E User',
          active: false,
        });
      });

    await request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .set(authorizationHeader(accessToken))
      .expect(204);
    userId = undefined;

    await request(app.getHttpServer())
      .get(`/users/${created.body.data.id as number}`)
      .set(authorizationHeader(accessToken))
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/users/${otherUserId}`)
      .set(authorizationHeader(accessToken))
      .expect(204);
    otherUserId = undefined;

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}`)
      .set(authorizationHeader(accessToken))
      .expect(204);
    organizationId = undefined;

    await request(app.getHttpServer())
      .delete(`/organizations/${otherOrganizationId}`)
      .set(authorizationHeader(accessToken))
      .expect(204);
    otherOrganizationId = undefined;
  });
});

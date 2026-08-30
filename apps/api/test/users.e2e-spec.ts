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
  const email = `e2e-user-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;

  beforeAll(async () => {
    app = await createE2eApp();
    accessToken = await createE2eAccessToken(app);
  });

  afterAll(async () => {
    if (userId !== undefined) {
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set(authorizationHeader(accessToken));
    }
    await app.close();
  });

  it('creates, reads, updates, lists, and deletes a user', async () => {
    const created = await request(app.getHttpServer())
      .post('/users')
      .set(authorizationHeader(accessToken))
      .send({
        organizationId: null,
        email,
        displayName: 'E2E User',
        role: 'member',
      })
      .expect(201);

    userId = created.body.data.id as number;
    expect(created.body).toMatchObject({
      data: {
        id: userId,
        organizationId: null,
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

    await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set(authorizationHeader(accessToken))
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toMatchObject({ id: userId, email });
      });

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
      .get('/users')
      .set(authorizationHeader(accessToken))
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toEqual(
          expect.arrayContaining([expect.objectContaining({ id: userId })]),
        );
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
  });
});

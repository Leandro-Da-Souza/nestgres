import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createE2eApp } from './create-e2e-app';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let userId: number | undefined;
  const email = `e2e-user-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    if (userId !== undefined) {
      await request(app.getHttpServer()).delete(`/users/${userId}`);
    }
    await app.close();
  });

  it('creates, reads, updates, lists, and deletes a user', async () => {
    const created = await request(app.getHttpServer())
      .post('/users')
      .send({
        organizationId: null,
        email,
        displayName: 'E2E User',
        role: 'member',
      })
      .expect(201);

    userId = created.body.id as number;
    expect(created.body).toMatchObject({
      id: userId,
      organizationId: null,
      email,
      displayName: 'E2E User',
      role: 'member',
    });

    await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({ id: userId, email });
      });

    await request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .send({ displayName: 'Updated E2E User', active: false })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: userId,
          displayName: 'Updated E2E User',
          active: false,
        });
      });

    await request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.arrayContaining([expect.objectContaining({ id: userId })]),
        );
      });

    await request(app.getHttpServer()).delete(`/users/${userId}`).expect(204);
    userId = undefined;

    await request(app.getHttpServer())
      .get(`/users/${created.body.id as number}`)
      .expect(404);
  });
});

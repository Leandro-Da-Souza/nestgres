import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createE2eApp } from './create-e2e-app';

describe('Organizations (e2e)', () => {
  let app: INestApplication<App>;
  let organizationId: number | undefined;
  const name = `e2e-organization-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    if (organizationId !== undefined) {
      await request(app.getHttpServer()).delete(
        `/organizations/${organizationId}`,
      );
    }
    await app.close();
  });

  it('creates, reads, updates, lists, and deletes an organization', async () => {
    const created = await request(app.getHttpServer())
      .post('/organizations')
      .send({ name, plan: 'free', countryCode: 'SE' })
      .expect(201);

    organizationId = created.body.id as number;
    expect(created.body).toMatchObject({
      id: organizationId,
      name,
      plan: 'free',
      countryCode: 'SE',
    });

    await request(app.getHttpServer())
      .get(`/organizations/${organizationId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({ id: organizationId, name });
      });

    await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}`)
      .send({ plan: 'pro' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({ id: organizationId, plan: 'pro' });
      });

    await request(app.getHttpServer())
      .get('/organizations')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: organizationId }),
          ]),
        );
      });

    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}`)
      .expect(204);
    organizationId = undefined;

    await request(app.getHttpServer())
      .get(`/organizations/${created.body.id as number}`)
      .expect(404);
  });
});

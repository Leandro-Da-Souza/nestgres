import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createE2eApp } from './create-e2e-app';
import { authorizationHeader, createE2eAccessToken } from './e2e-auth';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  beforeEach(async () => {
    app = await createE2eApp();
    accessToken = await createE2eAccessToken(app);
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .set(authorizationHeader(accessToken))
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          data: 'Hello World!',
          meta: {
            timestamp: expect.any(String),
            durationMs: expect.any(Number),
            path: '/',
            method: 'GET',
          },
        });
      });
  });

  afterEach(async () => {
    await app.close();
  });
});

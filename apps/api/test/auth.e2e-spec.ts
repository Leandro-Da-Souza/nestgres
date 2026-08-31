/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import * as argon2 from 'argon2';
import { PG_POOL } from '../src/database/database.constants';
import { Pool } from 'pg';
import { createE2eApp } from './create-e2e-app';
import { authorizationHeader, createE2eAccessToken } from './e2e-auth';

describe('Authentication (e2e)', () => {
  let app: INestApplication<App>;
  let superAdminToken: string;
  let userId: number | undefined;
  const email = `e2e-auth-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
  const password = 'e2e-auth-password';

  beforeAll(async () => {
    app = await createE2eApp();
    superAdminToken = await createE2eAccessToken(app);
    const user = await request(app.getHttpServer())
      .post('/users')
      .set(authorizationHeader(superAdminToken))
      .send({ email, displayName: 'Authentication E2E User', role: 'member' })
      .expect(201);
    userId = user.body.data.id as number;
    const pool = app.get<Pool>(PG_POOL);
    await pool.query({
      text: 'UPDATE users SET password_hash = $1 WHERE id = $2',
      values: [await argon2.hash(password), userId],
    });
  });

  afterAll(async () => {
    if (userId !== undefined)
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set(authorizationHeader(superAdminToken));
    await app.close();
  });

  it('accepts valid credentials and returns an authenticated profile', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);
    expect(login.body.data.access_token).toEqual(expect.any(String));
    await request(app.getHttpServer())
      .get('/auth/profile')
      .set(authorizationHeader(login.body.data.access_token as string))
      .expect(200)
      .expect(({ body }) =>
        expect(body.data).toMatchObject({
          sub: userId,
          email,
          role: 'member',
          organizationId: null,
        }),
      );
  });

  it('rejects invalid credentials, missing tokens, expired tokens, and tampered tokens', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);
    await request(app.getHttpServer()).get('/auth/profile').expect(401);
    const jwtService = app.get(JwtService);
    const expired = await jwtService.signAsync(
      { sub: userId, email, role: 'member', organizationId: null },
      { expiresIn: '-1s' },
    );
    await request(app.getHttpServer())
      .get('/auth/profile')
      .set(authorizationHeader(expired))
      .expect(401);
    const valid = await createE2eAccessToken(app, null, 'member');
    const tampered = `${valid.slice(0, -1)}${valid.endsWith('a') ? 'b' : 'a'}`;
    await request(app.getHttpServer())
      .get('/auth/profile')
      .set(authorizationHeader(tampered))
      .expect(401);
  });
});

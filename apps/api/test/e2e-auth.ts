import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { App } from 'supertest/types';

export async function createE2eAccessToken(
  app: INestApplication<App>,
  organizationId: number | null = null,
): Promise<string> {
  const jwtService = app.get(JwtService);

  return jwtService.signAsync({
    sub: 0,
    email: 'e2e-super-admin@example.test',
    role: 'super_admin',
    organizationId,
  });
}

export function authorizationHeader(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { App } from 'supertest/types';
import { UserRole } from '../src/users/types/userType';

export async function createE2eAccessToken(
  app: INestApplication<App>,
  organizationId: number | null = null,
  role: UserRole = 'super_admin',
): Promise<string> {
  const jwtService = app.get(JwtService);

  return jwtService.signAsync({
    sub: 0,
    email: `e2e-${role}@example.test`,
    role,
    organizationId,
  });
}

export function authorizationHeader(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

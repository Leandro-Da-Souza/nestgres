import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { MetaResponseInterceptor } from '../src/common/interceptors/meta-response.interceptor';
import cookieParser from 'cookie-parser';

const API_PREFIX = '/api';

export function apiRequest(app: App) {
  const client = request(app);

  return {
    get: (path: string) => client.get(`${API_PREFIX}${path}`),
    post: (path: string) => client.post(`${API_PREFIX}${path}`),
    patch: (path: string) => client.patch(`${API_PREFIX}${path}`),
    delete: (path: string) => client.delete(`${API_PREFIX}${path}`),
  };
}

export function apiAgent(app: App) {
  const client = request.agent(app);

  return {
    get: (path: string) => client.get(`${API_PREFIX}${path}`),
    post: (path: string) => client.post(`${API_PREFIX}${path}`),
    patch: (path: string) => client.patch(`${API_PREFIX}${path}`),
    delete: (path: string) => client.delete(`${API_PREFIX}${path}`),
  };
}

export async function createE2eApp(): Promise<INestApplication<App>> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new MetaResponseInterceptor());
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  await app.init();

  return app;
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { type Request } from 'express';

export interface MetaApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    durationMs: number;
    path: string;
    method: string;
  };
}

@Injectable()
export class MetaResponseInterceptor<T> implements NestInterceptor<
  T,
  MetaApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<MetaApiResponse<T>> {
    const startedAt = Date.now();
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data) => ({
        data,
        meta: {
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - startedAt,
          path: request.url,
          method: request.method,
        },
      })),
    );
  }
}

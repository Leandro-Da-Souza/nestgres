import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Request } from 'express';
import type { ApiResponse } from '@nestgres/contracts';

@Injectable()
export class MetaResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const startedAt = Date.now();
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data: T): ApiResponse<T> => ({
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

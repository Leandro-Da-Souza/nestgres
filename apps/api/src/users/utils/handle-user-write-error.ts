import { isPostgresError } from '../../database/utils/is-postgres-error';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

export function handleUserWriteError(error: unknown): never {
  if (isPostgresError(error)) {
    const errorFactory: Record<string, () => Error> = {
      '23502': () =>
        new BadRequestException('A required user field cannot be null.'),
      '23503': () =>
        new NotFoundException('Referenced organization does not exist.'),
      '23505': () => new ConflictException('Unique value already exists.'),
      '23514': () =>
        new BadRequestException('User data violates a constraint.'),
    };

    const createError = errorFactory[error.code];

    if (createError) {
      throw createError();
    }
  }
  throw error;
}

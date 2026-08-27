import { isPostgresError } from '../../database/utils/is-postgres-error';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export function handleInvoiceWriteError(error: unknown): never {
  if (isPostgresError(error)) {
    const errorFactory: Record<string, () => Error> = {
      '23514': () => {
        return new BadRequestException(
          'Invoice dates, status, payment details, or amount are inconsistent.',
        );
      },
      '23503': () => {
        return new NotFoundException('Referenced organization not found.');
      },
    };

    const createError = errorFactory[error.code];

    if (createError) {
      throw createError();
    }
  }

  throw error;
}

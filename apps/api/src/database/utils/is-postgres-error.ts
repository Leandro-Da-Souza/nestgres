export type PostgresError = Error & {
  code: string;
  constraint?: string;
};

export function isPostgresError(error: unknown): error is PostgresError {
  return (
    error instanceof Error && 'code' in error && typeof error.code === 'string'
  );
}

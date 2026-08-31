const database = process.env.TEST_PGDATABASE ?? 'nestgres_test';

if (!/(^|_)test($|_)/i.test(database)) {
  throw new Error(
    `Refusing to run e2e tests against non-test database "${database}". Set TEST_PGDATABASE to a dedicated test database.`,
  );
}

process.env.PGDATABASE = database;
process.env.JWT_SECRET = 'e2e-test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';

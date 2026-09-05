import { Inject, Module, OnApplicationShutdown, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PG_POOL } from './database.constants';

@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const connectionTimeoutMillis = Number(
          configService.getOrThrow<string>('PGCONNECTIONTIMEOUT'),
        );

        if (
          !Number.isSafeInteger(connectionTimeoutMillis) ||
          connectionTimeoutMillis <= 0
        ) {
          throw new Error(
            'PGCONNECTIONTIMEOUT must be a positive integer in milliseconds.',
          );
        }
        const pool = new Pool({
          host: configService.getOrThrow('PGHOST'),
          port: Number(configService.getOrThrow('PGPORT')),
          user: configService.getOrThrow('PGUSER'),
          password: configService.getOrThrow('PGPASSWORD'),
          database: configService.getOrThrow('PGDATABASE'),
          connectionTimeoutMillis,
        });

        await connectWithRetry(pool);

        return pool;
      },
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}

async function connectWithRetry(
  pool: Pool,
  retries = 5,
  delay = 2000,
): Promise<void> {
  const logger = new Logger('DatabaseModule');
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.log(`Attempting DB connection ${attempt} out of ${retries}`);

      await pool.query('SELECT 1');
      return;
    } catch (error) {
      logger.error(`DB connection failed: ${error}`);

      if (attempt === retries) {
        await pool.end();
        throw error;
      }

      logger.warn(`Retry in ${delay / 1000} seconds`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

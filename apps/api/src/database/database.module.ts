import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PG_POOL } from './database.constants';

@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Pool({
          host: configService.getOrThrow('PGHOST'),
          port: Number(configService.getOrThrow('PGPORT')),
          user: configService.getOrThrow('PGUSER'),
          password: configService.getOrThrow('PGPASSWORD'),
          database: configService.getOrThrow('PGDATABASE'),
        });
      },
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule {}

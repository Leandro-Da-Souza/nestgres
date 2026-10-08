import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { DatabaseModule } from '../database/database.module';
import { InvoiceScheduler } from './scheduling/invoice.scheduler';

@Module({
  imports: [DatabaseModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoiceScheduler],
  exports: [InvoicesService],
})
export class InvoicesModule {}

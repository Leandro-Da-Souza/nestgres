import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InvoicesService } from '../invoices.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class InvoiceScheduler implements OnApplicationBootstrap {
  private readonly logger = new Logger(InvoiceScheduler.name);

  constructor(private readonly invoiceService: InvoicesService) {}

  public async onApplicationBootstrap(): Promise<void> {
    await this.reconcileStatuses();
  }

  @Cron('5 0 * * *', {
    timeZone: 'Europe/Stockholm',
  })
  public async reconcileStatusesDaily(): Promise<void> {
    await this.reconcileStatuses();
  }

  private async reconcileStatuses(): Promise<void> {
    const updated = await this.invoiceService.reconcileStatuses();

    this.logger.log(`Reconciled ${updated} invoice statuses`);
  }
}

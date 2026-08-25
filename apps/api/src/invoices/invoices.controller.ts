import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import type { InvoiceType } from './types/invoiceType';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoiceService: InvoicesService) {}

  @Get()
  getAllInvoices(): Promise<InvoiceType[]> {
    return this.invoiceService.getAllInvoices();
  }

  @Get(':id')
  getInvoiceById(@Param('id', ParseIntPipe) id: number): Promise<InvoiceType> {
    return this.invoiceService.getInvoiceById(id);
  }
}

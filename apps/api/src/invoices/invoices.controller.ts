import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import type { InvoiceType } from './types/invoiceType';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

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

  @Post()
  createInvoice(@Body() body: CreateInvoiceDto): Promise<InvoiceType> {
    return this.invoiceService.createInvoice(body);
  }
}

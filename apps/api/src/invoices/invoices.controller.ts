import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import type { InvoiceType } from './types/invoiceType';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

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

  @Patch(':id')
  updateInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Body() changes: UpdateInvoiceDto,
  ) {
    return this.invoiceService.updateInvoice(id, changes);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteInvoice(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.invoiceService.deleteInvoice(id);
  }
}

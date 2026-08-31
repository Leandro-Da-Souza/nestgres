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
  Request,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import type { InvoiceType } from './types/invoiceType';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { type AuthenticatedRequestType } from '../common/types/shared.types';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoiceService: InvoicesService) {}

  @Get()
  getAllInvoices(
    @Request() req: AuthenticatedRequestType,
  ): Promise<InvoiceType[]> {
    return this.invoiceService.getAllInvoices(req.user);
  }

  @Get(':id')
  getInvoiceById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequestType,
  ): Promise<InvoiceType> {
    return this.invoiceService.getInvoiceById(id, req.user);
  }

  @Roles('admin', 'super_admin')
  @Post()
  createInvoice(
    @Body() body: CreateInvoiceDto,
    @Request() req: AuthenticatedRequestType,
  ): Promise<InvoiceType> {
    return this.invoiceService.createInvoice(body, req.user);
  }

  @Roles('admin', 'super_admin')
  @Patch(':id')
  updateInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Body() changes: UpdateInvoiceDto,
    @Request() req: AuthenticatedRequestType,
  ) {
    return this.invoiceService.updateInvoice(id, changes, req.user);
  }

  @Roles('admin', 'super_admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequestType,
  ): Promise<void> {
    return this.invoiceService.deleteInvoice(id, req.user);
  }
}

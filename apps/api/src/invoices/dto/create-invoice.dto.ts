import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsPositive,
  Min,
  IsOptional,
  Matches,
} from 'class-validator';
import { INVOICE_STATUSES, type InvoiceStatus } from '../types/invoiceType';
import { CURRENCIES, type CurrencyType } from '../types/currencyType';

export class CreateInvoiceDto {
  @IsInt()
  @IsPositive()
  organizationId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @IsIn([...CURRENCIES])
  currency: CurrencyType;

  @IsIn([...INVOICE_STATUSES])
  status: InvoiceStatus;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  issuedOn: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  dueOn: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string | null;
}

import { IsString, IsNotEmpty, IsNumber, IsDate, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { InvoiceStatus, TelcoProvider } from '../entities/invoice.entity';
import { Type } from 'class-transformer';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @Type(() => Date)
  @IsDate()
  dueDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  paymentDate?: Date;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @IsEnum(TelcoProvider)
  @IsNotEmpty()
  provider: TelcoProvider;

  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @IsOptional()
  invoiceDetails?: Record<string, any>;

  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @IsUUID()
  @IsNotEmpty()
  uploadedById: string;
}

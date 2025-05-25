import { Controller, Get, Post, Body, Param, Delete, Patch, UseInterceptors, UploadedFile, BadRequestException, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadInvoice(
    @UploadedFile() file: Express.Multer.File,
    @Body('companyId') companyId: string,
    @Body('uploadedById') uploadedById: string,
    @Body('provider') provider?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo de fatura não fornecido');
    }

    // Processar o PDF e extrair informações, passando a operadora se especificada
    const extractedData = await this.invoicesService.processPdf(file.path, provider);

    // Criar a fatura com os dados extraídos
    const createDto: CreateInvoiceDto = {
      invoiceNumber: extractedData.invoiceNumber,
      amount: extractedData.amount,
      dueDate: extractedData.dueDate,
      // Usar a operadora detectada pelo microserviço ou a fornecida pelo usuário
      provider: extractedData.provider || provider || 'other',
      pdfUrl: file.path,
      invoiceDetails: extractedData.invoiceDetails,
      companyId,
      uploadedById,
    };

    return this.invoicesService.create(createDto);
  }

  @Get()
  async findAll(@Query('companyId') companyId?: string) {
    if (companyId) {
      return this.invoicesService.findByCompany(companyId);
    }
    return this.invoicesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }
}

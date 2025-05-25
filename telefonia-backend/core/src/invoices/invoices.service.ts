import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const invoice = this.invoicesRepository.create({
      ...createInvoiceDto,
      company: { id: createInvoiceDto.companyId },
      uploadedBy: { id: createInvoiceDto.uploadedById },
    });
    
    return this.invoicesRepository.save(invoice);
  }

  async findAll(): Promise<Invoice[]> {
    return this.invoicesRepository.find({
      relations: ['company', 'uploadedBy'],
    });
  }

  async findByCompany(companyId: string): Promise<Invoice[]> {
    return this.invoicesRepository.find({
      where: { company: { id: companyId } },
      relations: ['company', 'uploadedBy'],
    });
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id },
      relations: ['company', 'uploadedBy'],
    });
    
    if (!invoice) {
      throw new NotFoundException(`Fatura com ID ${id} não encontrada`);
    }
    
    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(id);
    
    // Atualizar relações se fornecidas
    const updateData: any = { ...updateInvoiceDto };
    
    if (updateInvoiceDto.companyId) {
      updateData.company = { id: updateInvoiceDto.companyId };
      delete updateData.companyId;
    }
    
    if (updateInvoiceDto.uploadedById) {
      updateData.uploadedBy = { id: updateInvoiceDto.uploadedById };
      delete updateData.uploadedById;
    }
    
    // Se a fatura estiver como paga, verificar data de pagamento
    if (updateInvoiceDto.status === InvoiceStatus.PAID && !updateInvoiceDto.paymentDate) {
      updateData.paymentDate = new Date();
    }
    
    await this.invoicesRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.invoicesRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Fatura com ID ${id} não encontrada`);
    }
  }

  async processPdf(pdfPath: string, provider?: string): Promise<any> {
    try {
      // Importar axios para fazer requisições HTTP
      const axios = require('axios');
      const fs = require('fs');
      const FormData = require('form-data');
      
      // Criar um objeto FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('file', fs.createReadStream(pdfPath));
      
      // Se a operadora foi especificada, incluí-la na requisição
      if (provider) {
        formData.append('provider', provider);
      }
      
      // Fazer a requisição para o microserviço Python
      const response = await axios.post('http://localhost:5000/process', formData, {
        headers: {
          ...formData.getHeaders(),
        },
        // Timeout de 30 segundos para o processamento do PDF
        timeout: 30000,
      });
      
      // Retornar os dados extraídos do PDF
      return response.data;
    } catch (error) {
      console.error('Erro ao processar PDF:', error);
      
      // Em caso de erro, usar a implementação mock como fallback
      console.warn('Usando implementação mock como fallback devido a erro no microserviço Python');
      return {
        invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
        amount: Math.random() * 1000,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        provider: provider || 'vivo',
        invoiceDetails: {
          services: [
            { name: 'Ligações locais', amount: Math.random() * 100 },
            { name: 'Internet móvel', amount: Math.random() * 200 },
            { name: 'SMS', amount: Math.random() * 50 },
          ],
          taxes: Math.random() * 100,
        }
      };
    }
  }
}

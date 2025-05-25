import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Company } from './entities/company.entity';
import { validateCNPJ } from '../utils/validators';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    private readonly httpService: HttpService,
  ) {}

  async fetchCNPJData(cnpj: string): Promise<any> {
    const cleanedCNPJ = cnpj.replace(/[^\d]/g, '');
    if (cleanedCNPJ.length !== 14) {
      throw new BadRequestException('CNPJ inválido. Deve conter 14 dígitos.');
    }
    const url = 'https://receitaws.com.br/v1/cnpj/' + cleanedCNPJ;
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      if (response.data.status === 'ERROR') {
        throw new NotFoundException('CNPJ não encontrado ou dados inválidos: ' + response.data.message);
      }
      return response.data;
    } catch (error) {
      // console.error('Erro ao consultar CNPJ ' + cleanedCNPJ + ' na ReceitaWS:', error.response?.data || error.message);
      // Simplificando o log de erro para evitar problemas com template string aqui também, se houver
      console.error('Erro ao consultar CNPJ na ReceitaWS:', error.message);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao consultar dados do CNPJ na API externa.');
    }
  }

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    if (!validateCNPJ(createCompanyDto.cnpj)) {
      throw new BadRequestException('CNPJ inválido');
    }
    
    const existingCompany = await this.companiesRepository.findOne({ 
      where: { cnpj: createCompanyDto.cnpj } 
    });
    
    if (existingCompany) {
      throw new BadRequestException('Já existe uma empresa com este CNPJ');
    }
    
    const company = this.companiesRepository.create(createCompanyDto);
    return this.companiesRepository.save(company);
  }

  async findAll(): Promise<Company[]> {
    return this.companiesRepository.find();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({ 
      where: { id },
      relations: ['users'] 
    });
    
    if (!company) {
      throw new NotFoundException('Empresa com ID ' + id + ' não encontrada');
    }
    
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    await this.findOne(id); 
    
    if (updateCompanyDto.cnpj) {
      if (!validateCNPJ(updateCompanyDto.cnpj)) {
        throw new BadRequestException('CNPJ inválido');
      }
      
      const existingCompany = await this.companiesRepository.findOne({ 
        where: { cnpj: updateCompanyDto.cnpj } 
      });
      
      if (existingCompany && existingCompany.id !== id) {
        throw new BadRequestException('Já existe uma empresa com este CNPJ');
      }
    }
    
    await this.companiesRepository.update(id, updateCompanyDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.companiesRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException('Empresa com ID ' + id + ' não encontrada');
    }
  }
}

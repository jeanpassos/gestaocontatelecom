import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { validateCNPJ } from '../utils/validators';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    if (!validateCNPJ(createCompanyDto.cnpj)) {
      throw new BadRequestException('CNPJ inválido');
    }
    
    // Verificar se já existe empresa com mesmo CNPJ
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
      throw new NotFoundException(`Empresa com ID ${id} não encontrada`);
    }
    
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    // Verificar se a empresa existe
    await this.findOne(id);
    
    // Se está tentando atualizar o CNPJ, validar e verificar duplicidade
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
      throw new NotFoundException(`Empresa com ID ${id} não encontrada`);
    }
  }
}

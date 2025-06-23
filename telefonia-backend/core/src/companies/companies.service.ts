import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Company } from './entities/company.entity';
import { Segment } from '../segments/entities/segment.entity';
import { Provider } from '../providers/entities/provider.entity';
import { validateCNPJ } from '../utils/validators';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(Segment)
    private segmentsRepository: Repository<Segment>,
    @InjectRepository(Provider)
    private providersRepository: Repository<Provider>,
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

    const { segmentId, telephonyProviderId, ...companyData } = createCompanyDto;
    const company = this.companiesRepository.create(companyData);

    if (segmentId) {
      const segment = await this.segmentsRepository.findOneBy({ id: segmentId });
      if (!segment) {
        console.warn(`Segmento com ID ${segmentId} não encontrado. Empresa será criada sem segmento associado.`);
      }
      company.segment = segment;
    }

    if (telephonyProviderId) {
      company.telephonyProviderId = telephonyProviderId;
    }
    
    return this.companiesRepository.save(company);
  }

  async findAll(): Promise<Company[]> {
    return this.companiesRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.segment', 'segment')
      .leftJoin('provider', 'telephonyProvider', 'company.telephony_provider_id = telephonyProvider.id')
      .addSelect([
        'telephonyProvider.id',
        'telephonyProvider.name',
        'telephonyProvider.type'
      ])
      .leftJoinAndSelect('company.users', 'users')
      .getMany()
      .then(companies => {
        return companies.map(company => ({
          ...company,
          telephonyProvider: company.telephonyProviderId 
            ? companies.find(c => c.id === company.id)?.['telephonyProvider'] || null
            : null
        }));
      });
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.segment', 'segment')
      .leftJoin('provider', 'telephonyProvider', 'company.telephony_provider_id = telephonyProvider.id')
      .addSelect([
        'telephonyProvider.id',
        'telephonyProvider.name',
        'telephonyProvider.type'
      ])
      .leftJoinAndSelect('company.users', 'users')
      .where('company.id = :id', { id })
      .getOne();

    if (!company) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada`);
    }

    if (company.telephonyProviderId) {
      const provider = await this.providersRepository.findOne({
        where: { id: company.telephonyProviderId }
      });
      (company as any).telephonyProvider = provider;
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    console.log(' CompaniesService.update INICIADO');
    console.log(' ID recebido:', id);
    console.log(' Dados recebidos:', JSON.stringify(updateCompanyDto, null, 2));
    
    const companyToUpdate = await this.findOne(id); // findOne já carrega o segmento
    
    console.log(' Empresa encontrada para atualizar:');
    console.log(' - ID:', companyToUpdate.id);
    console.log(' - Nome:', companyToUpdate.corporateName);
    
    if (updateCompanyDto.cnpj && updateCompanyDto.cnpj !== companyToUpdate.cnpj) {
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

    const { segmentId, ...companyData } = updateCompanyDto; // Removido telephonyProviderId
    
    console.log(' Dados a serem aplicados:', JSON.stringify(companyData, null, 2));
    
    Object.assign(companyToUpdate, companyData);

    console.log(' Empresa após Object.assign:');
    console.log(' - ID:', companyToUpdate.id);
    console.log(' - Nome:', companyToUpdate.corporateName);
    console.log(' - Assets:', JSON.stringify(companyToUpdate.assets, null, 2));

    if (segmentId !== undefined) { // Permite definir como null para remover
      if (segmentId === null) {
        companyToUpdate.segment = null;
      } else {
        const segment = await this.segmentsRepository.findOneBy({ id: segmentId });
        if (!segment) {
          console.warn(`Segmento com ID ${segmentId} não encontrado durante a atualização. Segmento não alterado.`);
        } else {
          companyToUpdate.segment = segment;
        }
      }
    }

    console.log(' ANTES de salvar no banco:');
    console.log(' - ID da empresa:', companyToUpdate.id);
    console.log(' - Nome da empresa:', companyToUpdate.corporateName);
    
    const savedCompany = await this.companiesRepository.save(companyToUpdate);
    
    console.log(' APÓS salvar no banco:');
    console.log(' - ID retornado pelo save:', savedCompany.id);
    console.log(' - Nome retornado pelo save:', savedCompany.corporateName);
    
    return savedCompany;
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);
    await this.companiesRepository.remove(company);
  }
}

import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Company } from './entities/company.entity';
import { Segment } from '../segments/entities/segment.entity';
// Provider não é mais injetado ou usado diretamente aqui para 'telephonyProvider'
// import { Provider } from '../providers/entities/provider.entity'; 
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
    // providersRepository não é mais necessário aqui para 'telephonyProvider'
    // @InjectRepository(Provider) 
    // private providersRepository: Repository<Provider>,
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

    const { segmentId, ...companyData } = createCompanyDto; // Removido telephonyProviderId
    const company = this.companiesRepository.create(companyData);

    if (segmentId) {
      const segment = await this.segmentsRepository.findOneBy({ id: segmentId });
      if (!segment) {
        console.warn(`Segmento com ID ${segmentId} não encontrado. Empresa será criada sem segmento associado.`);
      }
      company.segment = segment;
    }

    // Bloco do telephonyProviderId removido
    
    return this.companiesRepository.save(company);
  }

  async findAll(): Promise<Company[]> {
    // Removido 'telephonyProvider' das relações. 
    // A relação com contratos (e por sua vez, provedores) será carregada separadamente se necessário.
    return this.companiesRepository.find({ relations: ['segment', 'users', 'contracts'] }); 
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({ 
      where: { id },
      // Removido 'telephonyProvider'. Adicionado 'contracts' para carregar os contratos associados.
      relations: ['users', 'segment', 'contracts', 'contracts.provider'] 
    });
    
    if (!company) {
      throw new NotFoundException('Empresa com ID ' + id + ' não encontrada');
    }
    
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    const companyToUpdate = await this.findOne(id); // findOne já carrega o segmento
    
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
    
    Object.assign(companyToUpdate, companyData);

    if (segmentId !== undefined) { // Permite definir como null para remover
      if (segmentId === null) {
        companyToUpdate.segment = null;
      } else {
        const segment = await this.segmentsRepository.findOneBy({ id: segmentId });
        if (!segment) {
          console.warn(`Segmento com ID ${segmentId} não encontrado durante a atualização. Segmento não alterado.`);
          // Não altera companyToUpdate.segment se o novo ID for inválido e não for null
        } else {
          companyToUpdate.segment = segment;
        }
      }
    }

    // Bloco do telephonyProviderId removido

    await this.companiesRepository.save(companyToUpdate);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.companiesRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException('Empresa com ID ' + id + ' não encontrada');
    }
  }
}

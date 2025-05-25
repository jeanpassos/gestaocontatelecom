import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractStatus } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Company } from '../companies/entities/company.entity';
import { Provider } from '../providers/entities/provider.entity';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private contractsRepository: Repository<Contract>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
  ) {}

  async create(createContractDto: CreateContractDto): Promise<Contract> {
    const { companyId, providerId, ...restOfDto } = createContractDto;

    const company = await this.companyRepository.findOneBy({ id: companyId });
    if (!company) {
      throw new NotFoundException(`Company with ID "${companyId}" not found`);
    }

    const provider = await this.providerRepository.findOneBy({ id: providerId });
    if (!provider) {
      throw new NotFoundException(`Provider with ID "${providerId}" not found`);
    }

    const newContract = this.contractsRepository.create({
      ...restOfDto,
      company,
      provider,
    });

    return this.contractsRepository.save(newContract);
  }

  findAll(): Promise<Contract[]> {
    return this.contractsRepository.find({ relations: ['company', 'provider'] });
  }

  async findOne(id: string): Promise<Contract> {
    const contract = await this.contractsRepository.findOne({ 
      where: { id }, 
      relations: ['company', 'provider'] 
    });
    if (!contract) {
      throw new NotFoundException(`Contract with ID "${id}" not found`);
    }
    return contract;
  }

  async update(id: string, updateContractDto: UpdateContractDto): Promise<Contract> {
    const { companyId, providerId, ...restOfDto } = updateContractDto;
    
    const contract = await this.contractsRepository.preload({
      id: id,
      ...restOfDto,
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID "${id}" not found`);
    }

    if (companyId) {
      const company = await this.companyRepository.findOneBy({ id: companyId });
      if (!company) {
        throw new NotFoundException(`Company with ID "${companyId}" not found`);
      }
      contract.company = company;
    }

    if (providerId) {
      const provider = await this.providerRepository.findOneBy({ id: providerId });
      if (!provider) {
        throw new NotFoundException(`Provider with ID "${providerId}" not found`);
      }
      contract.provider = provider;
    }

    return this.contractsRepository.save(contract);
  }

  async remove(id: string): Promise<void> {
    const result = await this.contractsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Contract with ID "${id}" not found`);
    }
  }

  // Exemplo de método para encontrar contratos por empresa
  findByCompany(companyId: string): Promise<Contract[]> {
    return this.contractsRepository.find({
      where: { company: { id: companyId } },
      relations: ['provider'],
    });
  }

  // Exemplo de método para encontrar contratos por operadora
  findByProvider(providerId: string): Promise<Contract[]> {
    return this.contractsRepository.find({
      where: { provider: { id: providerId } },
      relations: ['company'],
    });
  }
}

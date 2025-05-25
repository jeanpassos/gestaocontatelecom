import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private providersRepository: Repository<Provider>,
  ) {}

  async create(createProviderDto: CreateProviderDto): Promise<Provider> {
    const existingProviderByValue = await this.providersRepository.findOne({
      where: { value: createProviderDto.value },
    });
    if (existingProviderByValue) {
      throw new ConflictException(`Uma operadora com o valor '${createProviderDto.value}' já existe.`);
    }

    const provider = this.providersRepository.create(createProviderDto);
    return this.providersRepository.save(provider);
  }

  async findAll(): Promise<Provider[]> {
    return this.providersRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Provider> {
    const provider = await this.providersRepository.findOneBy({ id });
    if (!provider) {
      throw new NotFoundException(`Operadora com ID '${id}' não encontrada.`);
    }
    return provider;
  }

  async update(id: string, updateProviderDto: UpdateProviderDto): Promise<Provider> {
    const provider = await this.findOne(id); // Verifica se existe

    if (updateProviderDto.value && updateProviderDto.value !== provider.value) {
      const existingProviderByValue = await this.providersRepository.findOne({
        where: { value: updateProviderDto.value },
      });
      if (existingProviderByValue && existingProviderByValue.id !== id) {
        throw new ConflictException(`Uma operadora com o valor '${updateProviderDto.value}' já existe.`);
      }
    }

    Object.assign(provider, updateProviderDto);
    return this.providersRepository.save(provider);
  }

  async remove(id: string): Promise<void> {
    const result = await this.providersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Operadora com ID '${id}' não encontrada.`);
    }
  }
}

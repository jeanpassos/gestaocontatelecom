import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { Company } from '../companies/entities/company.entity';
import { Provider } from '../providers/entities/provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Company, Provider])],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService], // Exporte o serviço se ele for usado em outros módulos
})
export class ContractsModule {}

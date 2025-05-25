import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { Company } from './entities/company.entity';
import { Segment } from '../segments/entities/segment.entity';
import { Provider } from '../providers/entities/provider.entity'; // Import Provider entity

@Module({
  imports: [TypeOrmModule.forFeature([Company, Segment, Provider]), HttpModule], // Add Provider here
  providers: [CompaniesService],
  controllers: [CompaniesController],
  exports: [CompaniesService]
})
export class CompaniesModule {}

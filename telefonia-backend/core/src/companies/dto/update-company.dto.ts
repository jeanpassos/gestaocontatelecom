import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto';
import { IsOptional, IsArray, IsString } from 'class-validator';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  // Garantir que phoneLines esteja disponível para update
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  phoneLines?: string[];
}

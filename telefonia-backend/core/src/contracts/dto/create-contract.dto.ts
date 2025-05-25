import { IsString, IsNotEmpty, IsUUID, IsOptional, IsArray, IsDateString, IsNumber, IsEnum, Min } from 'class-validator';
import { ContractStatus } from '../entities/contract.entity';

export class CreateContractDto {
  @IsNotEmpty({ message: 'O ID da empresa é obrigatório.' })
  @IsUUID('4', { message: 'O ID da empresa deve ser um UUID válido.' })
  companyId: string;

  @IsNotEmpty({ message: 'O ID do provedor é obrigatório.' })
  @IsUUID('4', { message: 'O ID do provedor deve ser um UUID válido.' })
  providerId: string;

  @IsOptional()
  @IsString({ message: 'O número do contrato deve ser uma string.' })
  contractNumber?: string;

  @IsOptional()
  @IsArray({ message: 'As linhas telefônicas devem ser um array de strings.' })
  @IsString({ each: true, message: 'Cada linha telefônica deve ser uma string.' })
  phoneLines?: string[];

  @IsOptional()
  @IsDateString({}, { message: 'A data do contrato deve ser uma data válida.' })
  contractDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'A data de renovação deve ser uma data válida.' })
  renewalDate?: string;

  @IsOptional()
  @IsNumber({}, { message: 'A taxa mensal deve ser um número.' })
  @Min(0, { message: 'A taxa mensal não pode ser negativa.' })
  monthlyFee?: number;

  @IsOptional()
  @IsEnum(ContractStatus, { message: 'Status do contrato inválido.' })
  status?: ContractStatus;

  @IsOptional()
  @IsString({ message: 'A observação deve ser uma string.' })
  observation?: string;
}

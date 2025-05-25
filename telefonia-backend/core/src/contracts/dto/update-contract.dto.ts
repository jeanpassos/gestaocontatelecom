import { PartialType } from '@nestjs/mapped-types';
import { CreateContractDto } from './create-contract.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateContractDto extends PartialType(CreateContractDto) {
  // Os campos companyId e providerId são opcionais na atualização,
  // mas se fornecidos, devem ser UUIDs válidos.
  // O PartialType já torna todos os campos de CreateContractDto opcionais.
  // Adicionamos validações específicas se necessário para campos que não estão em CreateContractDto
  // ou se quisermos sobrescrever a validação de opcionalidade para UUIDs.

  @IsOptional()
  @IsUUID('4', { message: 'O ID da empresa deve ser um UUID válido se fornecido.' })
  companyId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'O ID do provedor deve ser um UUID válido se fornecido.' })
  providerId?: string;
}

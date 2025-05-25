import { IsString, IsNotEmpty, IsArray, IsObject, IsOptional, IsUUID } from 'class-validator';
import { Segment } from '../../segments/entities/segment.entity';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @IsString()
  @IsNotEmpty()
  corporateName: string;

  @IsArray()
  @IsOptional()
  phoneLines?: string[];

  @IsObject()
  @IsOptional()
  assets?: Record<string, any>;

  // segment pode ser o ID (UUID) do segmento ou o valor string (ex: "comercio")
  // Se for o valor, o serviço precisará buscar o Segment correspondente.
  // Por simplicidade, vamos assumir que o frontend enviará o ID do segmento.
  // Se o frontend envia o 'value', precisaremos de uma lógica de transformação ou buscar pelo 'value'.
  // Para agora, vamos permitir uma string e o serviço cuidará de encontrar o Segment.
  @IsString()
  @IsOptional()
  @IsUUID()
  segmentId?: string; // Esperando o UUID do Segmento

  // Outros campos que foram adicionados ao CompanyModal no frontend
  @IsString()
  @IsOptional()
  type?: 'headquarters' | 'branch';

  @IsString()
  @IsOptional()
  @IsUUID()
  telephonyProviderId?: string; // Esperando o UUID do Provider de telefonia

  // provider de internet continua sendo uma string dentro de assets.internet.provider
  // não precisa de campo separado no DTO principal se estiver dentro de assets.

  @IsString()
  @IsOptional()
  contractDate?: string;

  @IsString()
  @IsOptional()
  renewalDate?: string;

  @IsObject()
  @IsOptional()
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };

  @IsObject()
  @IsOptional()
  manager?: {
    name?: string;
    email?: string;
    phone?: string;
    hasWhatsapp?: boolean;
  };
  
  @IsArray()
  @IsOptional()
  assignedUsers?: string[];

  @IsString()
  @IsOptional()
  observation?: string;
}

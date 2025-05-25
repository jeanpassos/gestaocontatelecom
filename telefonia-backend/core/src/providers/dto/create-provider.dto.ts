import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ProviderType } from '../entities/provider.entity';

export class CreateProviderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsEnum(ProviderType)
  @IsOptional()
  type?: ProviderType;
}

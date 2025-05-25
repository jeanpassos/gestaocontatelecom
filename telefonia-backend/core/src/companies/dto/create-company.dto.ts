import { IsString, IsNotEmpty, IsArray, IsObject } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @IsString()
  @IsNotEmpty()
  corporateName: string;

  @IsArray()
  phoneLines: string[];

  @IsObject()
  assets: Record<string, any>;
}

import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateSegmentDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  // Poderíamos adicionar uma validação de formato (ex: snake_case) aqui se desejado
  // @Matches(/^[a-z0-9_]+$/)
  value: string;
}

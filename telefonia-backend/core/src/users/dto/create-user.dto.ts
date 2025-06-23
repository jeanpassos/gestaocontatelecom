import { IsString, IsEmail, IsNotEmpty, IsEnum, IsUUID, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsUUID()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsOptional()
  name?: string; // Adicionando name como opcional, já que a entidade User o possui

  @IsString()
  @IsOptional()
  phone?: string; // Renomeado de phoneNumber para phone para consistência com a entidade

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

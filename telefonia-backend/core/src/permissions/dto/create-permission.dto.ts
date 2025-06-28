import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  role: string;

  @IsString()
  permissionId: string;

  @IsBoolean()
  @IsOptional()
  granted?: boolean = true;
}

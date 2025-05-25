import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// UpdateUserDto herda todas as propriedades de CreateUserDto,
// mas as torna todas opcionais.
export class UpdateUserDto extends PartialType(CreateUserDto) {}

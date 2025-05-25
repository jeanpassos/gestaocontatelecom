import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('providers')
@UseGuards(JwtAuthGuard, RolesGuard) // Proteger todas as rotas
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  @Roles(UserRole.ADMIN) // Apenas admins podem criar
  create(@Body() createProviderDto: CreateProviderDto) {
    return this.providersService.create(createProviderDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.CONSULTANT) // Permitir que mais roles visualizem
  findAll() {
    return this.providersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.CONSULTANT)
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN) // Apenas admins podem atualizar
  update(@Param('id') id: string, @Body() updateProviderDto: UpdateProviderDto) {
    return this.providersService.update(id, updateProviderDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN) // Apenas admins podem deletar
  remove(@Param('id') id: string) {
    return this.providersService.remove(id);
  }
}

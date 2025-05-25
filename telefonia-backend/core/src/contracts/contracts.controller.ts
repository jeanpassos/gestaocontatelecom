import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards, Query } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity'; // Corrigido para UserRole

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard) // Proteger todas as rotas do controller
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CONSULTANT) // Apenas Admin e Consultant podem criar
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CONSULTANT, UserRole.CLIENT) // Todos os perfis logados podem listar
  findAll(
    @Query('companyId') companyId?: string,
    @Query('providerId') providerId?: string,
  ) {
    if (companyId) {
      return this.contractsService.findByCompany(companyId);
    }
    if (providerId) {
      return this.contractsService.findByProvider(providerId);
    }
    return this.contractsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CONSULTANT, UserRole.CLIENT) // Todos os perfis logados podem ver um específico
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.CONSULTANT) // Apenas Admin e Consultant podem atualizar
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateContractDto: UpdateContractDto) {
    return this.contractsService.update(id, updateContractDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN) // Apenas Admin pode deletar
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.remove(id);
  }
}

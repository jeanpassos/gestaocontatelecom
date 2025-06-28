import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // Buscar matriz completa de permissões (todos os roles)
  @Get('matrix')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.CONSULTANT, UserRole.CLIENT)
  async getMatrix() {
    return this.permissionsService.findAllMatrix();
  }

  // Buscar permissões de um role específico
  @Get('role/:role')
  async getByRole(@Param('role') role: string) {
    return this.permissionsService.findByRole(role);
  }

  // Verificar se um role tem uma permissão específica
  @Get('check/:role/:permissionId')
  async checkPermission(
    @Param('role') role: string,
    @Param('permissionId') permissionId: string
  ) {
    const hasPermission = await this.permissionsService.hasPermission(role, permissionId);
    return { hasPermission };
  }

  // Atualizar matriz completa de permissões
  @Put('matrix')
  @Roles(UserRole.ADMIN)
  async updateMatrix(@Body('matrix') matrix: Record<string, Record<string, boolean>>) {
    await this.permissionsService.updateMatrix(matrix);
    return { 
      message: 'Matriz de permissões atualizada com sucesso',
      matrix: await this.permissionsService.findAllMatrix()
    };
  }

  // Resetar para permissões padrão
  @Post('reset-default')
  @Roles(UserRole.ADMIN)
  async resetToDefault() {
    await this.permissionsService.resetToDefault();
    return { 
      message: 'Permissões resetadas para padrão com sucesso',
      matrix: await this.permissionsService.findAllMatrix()
    };
  }
  
  // Obter timestamp da última atualização da matriz de permissões
  // Este endpoint é usado para polling de atualizações no frontend
  @Get('last-updated')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.CONSULTANT, UserRole.CLIENT)
  async getLastUpdated() {
    return this.permissionsService.getLastUpdatedTimestamp();
  }

  // CRUD básico
  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(+id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(+id);
  }
}

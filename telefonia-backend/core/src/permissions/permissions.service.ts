import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  // Timestamp de última atualização da matriz de permissões
  private lastUpdatedTimestamp: number = Date.now();
  
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  // Buscar todas as permissões por role
  async findByRole(role: string): Promise<Permission[]> {
    return this.permissionsRepository.find({
      where: { role },
      order: { permissionId: 'ASC' }
    });
  }

  // Buscar matriz completa de permissões (todos os roles)
  async findAllMatrix(): Promise<Record<string, Record<string, boolean>>> {
    const permissions = await this.permissionsRepository.find();
    
    const matrix: Record<string, Record<string, boolean>> = {};
    
    permissions.forEach(permission => {
      if (!matrix[permission.role]) {
        matrix[permission.role] = {};
      }
      matrix[permission.role][permission.permissionId] = permission.granted;
    });
    
    return matrix;
  }

  // Verificar se um role tem uma permissão específica
  async hasPermission(role: string, permissionId: string): Promise<boolean> {
    const permission = await this.permissionsRepository.findOne({
      where: { role, permissionId }
    });
    
    return permission ? permission.granted : false;
  }

  // Obter timestamp da última atualização de permissões
  getLastUpdatedTimestamp(): { timestamp: number } {
    return { timestamp: this.lastUpdatedTimestamp };
  }
  
  // Atualizar matriz completa de permissões
  async updateMatrix(matrix: Record<string, Record<string, boolean>>): Promise<void> {
    // Deletar todas as permissões existentes
    await this.permissionsRepository.delete({});
    
    // Inserir novas permissões baseadas na matriz
    const permissions: CreatePermissionDto[] = [];
    
    Object.keys(matrix).forEach(role => {
      Object.keys(matrix[role]).forEach(permissionId => {
        permissions.push({
          role,
          permissionId,
          granted: matrix[role][permissionId]
        });
      });
    });
    
    // Inserir em lote se suportado pelo banco
    if (permissions.length > 0) {
      await this.permissionsRepository.save(permissions);
    }
    
    // Atualizar o timestamp da última modificação
    this.lastUpdatedTimestamp = Date.now();
    console.log(`Matriz de permissões atualizada em: ${new Date(this.lastUpdatedTimestamp).toISOString()}`);
  }

  // CRUD básico
  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionsRepository.create(createPermissionDto);
    return this.permissionsRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionsRepository.find({
      order: { role: 'ASC', permissionId: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionsRepository.findOne({ where: { id } });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    await this.permissionsRepository.update(id, updatePermissionDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.permissionsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
  }

  // Resetar para permissões padrão
  async resetToDefault(): Promise<void> {
    // Deletar todas as permissões
    await this.permissionsRepository.delete({});
    
    // Recriar permissões padrão
    const defaultPermissions = [
      // Admin - acesso total
      { role: 'admin', permissionId: 'dashboard.view', granted: true },
      { role: 'admin', permissionId: 'companies.view', granted: true },
      { role: 'admin', permissionId: 'companies.create', granted: true },
      { role: 'admin', permissionId: 'companies.edit', granted: true },
      { role: 'admin', permissionId: 'companies.delete', granted: true },
      { role: 'admin', permissionId: 'invoices.view', granted: true },
      { role: 'admin', permissionId: 'invoices.upload', granted: true },
      { role: 'admin', permissionId: 'invoices.edit', granted: true },
      { role: 'admin', permissionId: 'invoices.delete', granted: true },
      { role: 'admin', permissionId: 'reports.view', granted: true },
      { role: 'admin', permissionId: 'reports.export', granted: true },
      { role: 'admin', permissionId: 'admin.view', granted: true },
      { role: 'admin', permissionId: 'users.view', granted: true },
      { role: 'admin', permissionId: 'users.create', granted: true },
      { role: 'admin', permissionId: 'users.edit', granted: true },
      { role: 'admin', permissionId: 'users.delete', granted: true },
      { role: 'admin', permissionId: 'permissions.manage', granted: true },
      
      // Supervisor - acesso médio
      { role: 'supervisor', permissionId: 'dashboard.view', granted: true },
      { role: 'supervisor', permissionId: 'companies.view', granted: true },
      { role: 'supervisor', permissionId: 'companies.create', granted: true },
      { role: 'supervisor', permissionId: 'companies.edit', granted: true },
      { role: 'supervisor', permissionId: 'invoices.view', granted: true },
      { role: 'supervisor', permissionId: 'invoices.upload', granted: true },
      { role: 'supervisor', permissionId: 'invoices.edit', granted: true },
      { role: 'supervisor', permissionId: 'reports.view', granted: true },
      { role: 'supervisor', permissionId: 'reports.export', granted: true },
      { role: 'supervisor', permissionId: 'users.view', granted: true },
      
      // Consultant - acesso limitado
      { role: 'consultant', permissionId: 'dashboard.view', granted: true },
      { role: 'consultant', permissionId: 'companies.view', granted: true },
      { role: 'consultant', permissionId: 'invoices.view', granted: true },
      { role: 'consultant', permissionId: 'consultant.dashboard', granted: true },
      
      // Client - acesso mínimo
      { role: 'client', permissionId: 'dashboard.view', granted: true },
      { role: 'client', permissionId: 'invoices.view', granted: true }
    ];
    
    await this.permissionsRepository.save(defaultPermissions);
  }
}

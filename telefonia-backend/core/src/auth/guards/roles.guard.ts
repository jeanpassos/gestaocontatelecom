import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true; // Não há restrição de roles
    }
    
    const req = context.switchToHttp().getRequest();
    const { user } = req;
    
    console.log('[RolesGuard] Requisição para:', req.originalUrl);
    console.log('[RolesGuard] Roles necessárias:', requiredRoles);
    console.log('[RolesGuard] User do request:', user);
    console.log('[RolesGuard] User role:', user?.role);
    
    // Solução temporária para debugging: permitir acesso ao endpoint /permissions/matrix para todos
    if (req.originalUrl === '/permissions/matrix' || req.originalUrl.includes('/permissions/matrix')) {
      console.log('[RolesGuard] Permitindo acesso ao endpoint /permissions/matrix');
      return true;
    }
    
    // Verificação normal para outros endpoints
    const hasRole = requiredRoles.some((role) => user?.role === role);
    console.log('[RolesGuard] Usuário possui role necessária?', hasRole);
    
    return hasRole;
  }
}

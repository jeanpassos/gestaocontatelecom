import { useCallback, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission, UserRole, DEFAULT_PERMISSION_MATRIX } from '../config/permissions';
import { permissionsService } from '../services/permissions.service';

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Carregar permissões assim que o componente montar ou o usuário mudar
  useEffect(() => {
    if (user?.role) {
      console.log('usePermissions: Carregando permissões para', user.role);
      // Usar a nova função ensurePermissionsLoaded para garantir que as permissões estão carregadas
      permissionsService.ensurePermissionsLoaded(user.role as UserRole)
        .then(() => {
          console.log('usePermissions: Permissões carregadas com sucesso');
          setPermissionsLoaded(true);
        })
        .catch((error: any) => {
          console.error('Erro ao carregar permissões:', error);
          // Mesmo com erro, marcar como carregado para permitir o fallback funcionar
          setPermissionsLoaded(true);
        });
    }
  }, [user?.role]);
  
  // Escutar eventos de atualização de permissões
  useEffect(() => {
    const handlePermissionsUpdated = () => {
      // Forçar re-render dos componentes que usam esse hook
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('permissionsUpdated', handlePermissionsUpdated);
    
    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissionsUpdated);
    };
  }, []);
  
  // Verificar permissão específica
  const checkPermission = useCallback(
    (permissionId: string): boolean => {
      try {
        // Verificar com serviço, mas ter fallback para hasPermission local
        if (!user) {
          return true; // Sem usuário, permitir (página de login)
        }
        
        // Usar o serviço de permissões que busca do localStorage (dinâmico)
        return permissionsService.checkPermission(user.role as UserRole || 'client', permissionId);
      } catch (error: any) {
        console.error('Erro ao verificar permissão:', error);
        // Em caso de erro, fallback para a matriz padrão
        return hasPermission(user?.role as UserRole || 'client', permissionId);
      }
    },
    [user?.role, forceUpdate]
  );
  
  // Verificar acesso a uma página específica
  const checkPageAccess = (page: string): boolean => {
    if (!user) return false;
    
    // Mapeamento de páginas para permissões necessárias
    const pagePermissions: Record<string, string[]> = {
      '/dashboard': ['dashboard.view'],
      '/companies': ['companies.view'],
      '/invoices': ['invoices.view'],
      '/reports': ['reports.view'],
      '/admin': ['admin.view'],
      '/consultant-dashboard': ['consultant.dashboard'],
    };
    
    const requiredPermissions = pagePermissions[page] || [];
    if (requiredPermissions.length === 0) return true;
    
    return requiredPermissions.some(permission => checkPermission(permission));
  };
  
  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };
  
  const isSupervisor = (): boolean => {
    return user?.role === 'supervisor';
  };
  
  const isConsultant = (): boolean => {
    return user?.role === 'consultant';
  };
  
  const isClient = (): boolean => {
    return user?.role === 'client';
  };
  
  return {
    checkPermission,
    checkPageAccess,
    isAdmin,
    isSupervisor,
    isConsultant,
    isClient,
    userRole: user?.role as UserRole,
    permissionsLoaded,
    // O valor de forceUpdate está aqui apenas para forçar re-renders
    forceUpdateValue: forceUpdate
  };
};

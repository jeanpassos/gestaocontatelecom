// Sistema de Matriz de Permissões
// Este arquivo define as permissões para cada role no sistema

export type UserRole = 'admin' | 'supervisor' | 'consultant' | 'client';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
}

export interface RolePermissions {
  [key: string]: boolean;
}

export interface PermissionMatrix {
  [role: string]: RolePermissions;
}

// Definição de todas as permissões disponíveis no sistema
export const AVAILABLE_PERMISSIONS: Permission[] = [
  // Dashboard
  { id: 'dashboard.view', name: 'Visualizar Dashboard', description: 'Acesso ao dashboard principal', category: 'Dashboard', resource: 'dashboard', action: 'view' },

  // Empresas/Contratos
  { id: 'companies.view', name: 'Visualizar Contratos', description: 'Ver lista de contratos/empresas', category: 'Contratos', resource: 'companies', action: 'view' },
  { id: 'companies.create', name: 'Criar Contratos', description: 'Criar novos contratos/empresas', category: 'Contratos', resource: 'companies', action: 'create' },
  { id: 'companies.edit', name: 'Editar Contratos', description: 'Editar contratos/empresas existentes', category: 'Contratos', resource: 'companies', action: 'edit' },
  { id: 'companies.delete', name: 'Excluir Contratos', description: 'Excluir contratos/empresas', category: 'Contratos', resource: 'companies', action: 'delete' },

  // Faturas
  { id: 'invoices.view', name: 'Visualizar Faturas', description: 'Ver lista de faturas', category: 'Faturas', resource: 'invoices', action: 'view' },
  { id: 'invoices.upload', name: 'Upload de Faturas', description: 'Fazer upload de novas faturas', category: 'Faturas', resource: 'invoices', action: 'upload' },
  { id: 'invoices.edit', name: 'Editar Faturas', description: 'Editar informações de faturas', category: 'Faturas', resource: 'invoices', action: 'edit' },
  { id: 'invoices.delete', name: 'Excluir Faturas', description: 'Excluir faturas', category: 'Faturas', resource: 'invoices', action: 'delete' },

  // Relatórios
  { id: 'reports.view', name: 'Visualizar Relatórios', description: 'Acessar módulo de relatórios', category: 'Relatórios', resource: 'reports', action: 'view' },
  { id: 'reports.export', name: 'Exportar Relatórios', description: 'Exportar relatórios em PDF/Excel', category: 'Relatórios', resource: 'reports', action: 'export' },

  // Administração
  { id: 'admin.view', name: 'Painel Administrativo', description: 'Acesso ao painel administrativo', category: 'Administração', resource: 'admin', action: 'view' },
  { id: 'users.view', name: 'Visualizar Usuários', description: 'Ver lista de usuários', category: 'Administração', resource: 'users', action: 'view' },
  { id: 'users.create', name: 'Criar Usuários', description: 'Criar novos usuários', category: 'Administração', resource: 'users', action: 'create' },
  { id: 'users.edit', name: 'Editar Usuários', description: 'Editar usuários existentes', category: 'Administração', resource: 'users', action: 'edit' },
  { id: 'users.delete', name: 'Excluir Usuários', description: 'Excluir usuários', category: 'Administração', resource: 'users', action: 'delete' },
  { id: 'permissions.manage', name: 'Gerenciar Permissões', description: 'Configurar matriz de permissões', category: 'Administração', resource: 'permissions', action: 'manage' },

  // Consultor
  { id: 'consultant.dashboard', name: 'Dashboard do Consultor', description: 'Acesso ao dashboard específico do consultor', category: 'Consultor', resource: 'consultant', action: 'dashboard' },
  { id: 'consultant.proposals', name: 'Gerenciar Propostas', description: 'Criar e gerenciar propostas comerciais', category: 'Consultor', resource: 'consultant', action: 'proposals' },
];

// Configuração padrão de permissões por role
export const DEFAULT_PERMISSION_MATRIX: PermissionMatrix = {
  admin: {
    // Administrador tem acesso total
    'dashboard.view': true,
    'companies.view': true,
    'companies.create': true,
    'companies.edit': true,
    'companies.delete': true,
    'invoices.view': true,
    'invoices.upload': true,
    'invoices.edit': true,
    'invoices.delete': true,
    'reports.view': true,
    'reports.export': true,
    'admin.view': true,
    'users.view': true,
    'users.create': true,
    'users.edit': true,
    'users.delete': true,
    'permissions.manage': true,
    'consultant.dashboard': false,
    'consultant.proposals': false,
  },
  
  supervisor: {
    // Supervisor tem acesso a operações principais mas não administração completa
    'dashboard.view': true,
    'companies.view': true,
    'companies.create': true,
    'companies.edit': true,
    'companies.delete': false,
    'invoices.view': true,
    'invoices.upload': true,
    'invoices.edit': true,
    'invoices.delete': false,
    'reports.view': true,
    'reports.export': true,
    'admin.view': false,
    'users.view': true,
    'users.create': false,
    'users.edit': false,
    'users.delete': false,
    'permissions.manage': false,
    'consultant.dashboard': false,
    'consultant.proposals': false,
  },
  
  consultant: {
    // Consultor tem acesso limitado + área específica
    'dashboard.view': true,
    'companies.view': true,
    'companies.create': true,
    'companies.edit': true,
    'companies.delete': false,
    'invoices.view': true,
    'invoices.upload': true,
    'invoices.edit': false,
    'invoices.delete': false,
    'reports.view': false,
    'reports.export': false,
    'admin.view': false,
    'users.view': false,
    'users.create': false,
    'users.edit': false,
    'users.delete': false,
    'permissions.manage': false,
    'consultant.dashboard': true,
    'consultant.proposals': true,
  },
  
  client: {
    // Cliente tem acesso muito limitado - apenas visualização
    'dashboard.view': true,
    'companies.view': true,
    'companies.create': false,
    'companies.edit': false,
    'companies.delete': false,
    'invoices.view': true,
    'invoices.upload': false,
    'invoices.edit': false,
    'invoices.delete': false,
    'reports.view': false,
    'reports.export': false,
    'admin.view': false,
    'users.view': false,
    'users.create': false,
    'users.edit': false,
    'users.delete': false,
    'permissions.manage': false,
    'consultant.dashboard': false,
    'consultant.proposals': false,
  },
};

// Chave para armazenar matriz de permissões no localStorage
const PERMISSIONS_STORAGE_KEY = 'telefonia_permission_matrix';

// Cache para evitar parsing constante do localStorage
let cachedPermissionMatrix: PermissionMatrix | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 1000; // 1 segundo

// Função para invalidar cache quando permissões são atualizadas
const invalidatePermissionsCache = () => {
  cachedPermissionMatrix = null;
};

// Escutar eventos de atualização de permissões
if (typeof window !== 'undefined') {
  window.addEventListener('permissionsUpdated', invalidatePermissionsCache);
}

// Função para carregar matriz de permissões do localStorage ou usar padrão
const getCurrentPermissionMatrix = (): PermissionMatrix => {
  const now = Date.now();
  
  // Usar cache se ainda válido
  if (cachedPermissionMatrix && (now - lastCacheTime) < CACHE_DURATION) {
    return cachedPermissionMatrix;
  }
  try {
    const savedMatrix = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
    if (savedMatrix) {
      const parsedMatrix = JSON.parse(savedMatrix);
      // Mesclar com padrão para garantir que todas as permissões existam
      const mergedMatrix: PermissionMatrix = {};
      Object.keys(DEFAULT_PERMISSION_MATRIX).forEach(role => {
        mergedMatrix[role] = {
          ...DEFAULT_PERMISSION_MATRIX[role],
          ...(parsedMatrix[role] || {})
        };
      });
      
      // Atualizar cache
      cachedPermissionMatrix = mergedMatrix;
      lastCacheTime = now;
      
      return mergedMatrix;
    }
  } catch (error) {
    console.error('Erro ao carregar matriz de permissões do localStorage:', error);
  }
  
  // Se não há dados salvos, usar padrão e cachear
  cachedPermissionMatrix = DEFAULT_PERMISSION_MATRIX;
  lastCacheTime = now;
  
  return DEFAULT_PERMISSION_MATRIX;
};

// Função para obter permissões de um role
export const getRolePermissions = (role: UserRole): RolePermissions => {
  // Usar a matriz do localStorage que é sincronizada com o backend pelo permissionsService
  const currentMatrix = getCurrentPermissionMatrix();
  return currentMatrix[role] || DEFAULT_PERMISSION_MATRIX[role] || {};
};

// Função para verificar se um usuário tem uma permissão específica
export const hasPermission = (userRole: UserRole, permissionId: string): boolean => {
  // Garantir que sempre usamos a versão mais atualizada da matriz de permissões
  const rolePermissions = getRolePermissions(userRole);
  
  // Adicionar logs para depuração
  console.log(`[DEBUG hasPermission] Role: ${userRole}, Permission: ${permissionId}`);
  console.log(`[DEBUG hasPermission] Value type: ${typeof rolePermissions[permissionId]}, Value: ${rolePermissions[permissionId]}`);
  console.log(`[DEBUG hasPermission] Strict equality check: ${rolePermissions[permissionId] === true}`);
  console.log(`[DEBUG hasPermission] Boolean conversion check: ${Boolean(rolePermissions[permissionId])}`);
  
  // Modificar para aceitar tanto true boolean quanto 1 como número
  // return rolePermissions[permissionId] === true;
  return Boolean(rolePermissions[permissionId]);
};

// Função para mapear permissões para rotas/páginas
export const getPagePermissions = (page: string): string[] => {
  const pagePermissions: { [key: string]: string[] } = {
    '/dashboard': ['dashboard.view'],
    '/companies': ['companies.view'],
    '/invoices': ['invoices.view'],
    '/reports': ['reports.view'],
    '/admin': ['admin.view'],
    '/consultant-dashboard': ['consultant.dashboard'],
  };
  
  return pagePermissions[page] || [];
};

// Função para verificar se usuário pode acessar uma página
export const canAccessPage = (userRole: UserRole, page: string): boolean => {
  const requiredPermissions = getPagePermissions(page);
  if (requiredPermissions.length === 0) return true;
  
  return requiredPermissions.some(permission => hasPermission(userRole, permission));
};

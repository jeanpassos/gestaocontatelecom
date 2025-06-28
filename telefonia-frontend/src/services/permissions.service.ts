import axios from 'axios';
import { API_URL } from './api';
import { UserRole } from '../config/permissions';

// Intervalo de verificação de atualização de permissões (em milissegundos)
const PERMISSIONS_CHECK_INTERVAL = 60000; // 1 minuto

const PERMISSIONS_STORAGE_KEY = 'telefonia_permission_matrix';

class PermissionsService {
  private permissionCheckInterval: NodeJS.Timeout | null = null;
  private lastUpdatedTimestamp: number = 0;
  
  constructor() {
    // Inicializa o timestamp da última atualização
    const savedMatrix = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
    if (savedMatrix) {
      this.lastUpdatedTimestamp = Date.now();
    }
  }
  
  // Método para verificar atualizações de permissões
  async checkPermissionsUpdate() {
    try {
      // Verificar se há token (usuário logado)
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }
      
      // Buscar timestamp da última atualização no backend
      const response = await axios.get(`${API_URL}/permissions/last-updated`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Se o timestamp do backend for mais recente que o local, atualizar
      if (response.data.timestamp > this.lastUpdatedTimestamp) {
        console.log('Atualização de permissões detectada, atualizando...');
        await this.refreshPermissions();
        this.lastUpdatedTimestamp = response.data.timestamp;
        return true; // Permissões foram atualizadas
      }
      return false; // Sem atualizações
    } catch (error) {
      console.error('Erro ao verificar atualizações de permissões:', error);
      return false;
    }
  }

  // Iniciar verificação periódica de atualização de permissões
  startPeriodicCheck() {
    console.log('Iniciando verificação periódica de permissões');
    this.stopPeriodicCheck(); // Garantir que não há duplicados
    
    // Verificar imediatamente ao iniciar (não esperar o primeiro intervalo)
    this.checkPermissionsUpdate();
    
    // Verificar a cada 30 segundos (reduzido de 1 minuto)
    this.permissionCheckInterval = setInterval(async () => {
      await this.checkPermissionsUpdate();
    }, 30000); // 30 segundos
    
    console.log('Verificação periódica de permissões iniciada');
  }
  
  // Parar verificação periódica
  stopPeriodicCheck() {
    if (this.permissionCheckInterval) {
      clearInterval(this.permissionCheckInterval);
      this.permissionCheckInterval = null;
      console.log('Verificação periódica de permissões parada');
    }
  }
  
  // Recarregar permissões do usuário atual e forçar sincronização com o backend
  async refreshPermissions(): Promise<boolean> {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (user && user.role) {
        // Limpar matriz inteira de permissões no localStorage para garantir resincronização completa
        localStorage.removeItem(PERMISSIONS_STORAGE_KEY);
        console.log('Matriz de permissões removida para forçar atualização completa');
        
        // Carregar a matriz completa de permissões do backend
        const matrix = await this.getMatrix();
        console.log('Matriz de permissões recarregada do backend:', Object.keys(matrix));
        
        // Verificar se as permissões do usuário existem na nova matriz
        if (!matrix[user.role]) {
          console.warn(`Perfil ${user.role} não encontrado na matriz de permissões!`);
          // Tentar carregar permissões especificas para o perfil
          await this.ensurePermissionsLoaded(user.role as UserRole);
        }
        
        // Disparar evento para atualizar todos os componentes
        window.dispatchEvent(new CustomEvent('permissionsUpdated'));
        
        console.log(`Permissões atualizadas com sucesso, perfil atual: ${user.role}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      return false;
    }
  }
  
  // Buscar matriz de permissões completa
  async getMatrix() {
    try {
      const response = await axios.get(`${API_URL}/permissions/matrix`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Salvar no localStorage como cache
      localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(response.data));
      
      // Disparar evento personalizado para atualização de componentes
      window.dispatchEvent(new CustomEvent('permissionsUpdated'));
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar matriz de permissões:', error);
      throw error;
    }
  }
  
  // Buscar permissões para um perfil específico
  async getRolePermissions(role: UserRole) {
    try {
      const response = await axios.get(`${API_URL}/permissions/role/${role}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar permissões para o perfil ${role}:`, error);
      throw error;
    }
  }
  
  // Atualizar matriz de permissões completa
  async updateMatrix(matrix: Record<string, Record<string, boolean>>) {
    try {
      const response = await axios.put(
        `${API_URL}/permissions/matrix`, 
        { matrix },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Atualiza localStorage e dispara evento
      localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(matrix));
      window.dispatchEvent(new CustomEvent('permissionsUpdated'));
      
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar matriz de permissões:', error);
      throw error;
    }
  }
  
  // Resetar para permissões padrão
  async resetToDefault() {
    try {
      const response = await axios.post(
        `${API_URL}/permissions/reset-default`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Buscar nova matriz atualizada
      await this.getMatrix();
      
      return response.data;
    } catch (error) {
      console.error('Erro ao resetar permissões para o padrão:', error);
      throw error;
    }
  }
  
  // Garantir que as permissões estejam carregadas e salvas no localStorage
  async ensurePermissionsLoaded(userRole: UserRole): Promise<void> {
    try {
      const savedMatrix = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
      if (!savedMatrix || !JSON.parse(savedMatrix)[userRole]) {
        console.log('Permissões não encontradas no localStorage para', userRole, '- Buscando do backend...');
        const rolePermissions = await this.getRolePermissions(userRole);
        
        // Se não há matriz no localStorage, criar uma nova
        const existingMatrix = savedMatrix ? JSON.parse(savedMatrix) : {};
        existingMatrix[userRole] = {};
        
        // Preencher com permissões do backend
        rolePermissions.forEach((perm: any) => {
          existingMatrix[userRole][perm.permissionId] = perm.granted === 1;
        });
        
        // Salvar no localStorage
        localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(existingMatrix));
        console.log(`Permissões para ${userRole} carregadas e salvas no localStorage:`, rolePermissions.length);
      } else {
        console.log('Permissões já carregadas no localStorage para', userRole);
      }
    } catch (error) {
      console.error('Erro ao garantir carregamento de permissões:', error);
    }
  }
  
  // Controle para evitar atualizações múltiplas simultâneas
  private isRefreshingPermissions = false;
  private permissionsRefreshDebounceTimer: NodeJS.Timeout | null = null;
  
  // Verificar se usuário tem uma permissão específica
  checkPermission(userRole: UserRole, permissionId: string): boolean {
    try {
      // Tentar ler do localStorage primeiro
      const savedMatrix = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
      if (savedMatrix) {
        const matrix = JSON.parse(savedMatrix);
        if (matrix[userRole] && matrix[userRole][permissionId] !== undefined) {
          // Permissão encontrada no localStorage
          // Aceitar tanto valor booleano true quanto valores numéricos 1 como 'permitido'
          const isGranted = matrix[userRole][permissionId] === true || matrix[userRole][permissionId] === 1;
          console.log(`[Permissão] ${userRole}.${permissionId}: ${isGranted ? 'PERMITIDO' : 'NEGADO'} (do localStorage)`);
          return isGranted;
        } else {
          // Permissão não encontrada no localStorage, mas matriz existe
          console.log(`[Permissão] ${userRole}.${permissionId}: NEGADO (permissão não encontrada no localStorage)`);
          
          // Verificar se já estamos em processo de atualização
          if (!this.isRefreshingPermissions) {
            // Debounce para evitar várias chamadas simultâneas
            if (this.permissionsRefreshDebounceTimer) {
              clearTimeout(this.permissionsRefreshDebounceTimer);
            }
            
            this.permissionsRefreshDebounceTimer = setTimeout(() => {
              this.isRefreshingPermissions = true;
              console.log(`Atualizando matriz de permissões para ${userRole} (debounced)...`);
              
              this.refreshPermissions().then(() => {
                console.log(`Matriz de permissões atualizada para ${userRole}`);
                window.dispatchEvent(new CustomEvent('permissionsUpdated'));
                this.isRefreshingPermissions = false;
              }).catch(() => {
                this.isRefreshingPermissions = false;
              });
            }, 1000); // Esperar 1 segundo antes de tentar atualizar
          } else {
            console.log('Já existe uma atualização de permissões em andamento, aguardando...');
          }
          
          // Para permissões de dashboard, permitir por padrão para evitar loops
          if (permissionId.includes('dashboard.view')) {
            console.log(`[Permissão] ${userRole}.${permissionId}: PERMITINDO acesso ao dashboard para evitar loops`);
            return true;
          }
          
          return false; // Negar acesso até confirmar permissão após atualização
        }
      } else {
        // Não existe matriz no localStorage, carregar completa
        console.log(`[Permissão] ${userRole}.${permissionId}: Matriz não encontrada no localStorage`);
        
        // Verificar se já estamos em processo de atualização
        if (!this.isRefreshingPermissions) {
          this.isRefreshingPermissions = true;
          console.log('Iniciando carregamento da matriz de permissões...');
          
          this.refreshPermissions().then(() => {
            console.log(`Matriz de permissões carregada para ${userRole}`);
            window.dispatchEvent(new CustomEvent('permissionsUpdated'));
            this.isRefreshingPermissions = false;
          }).catch(() => {
            this.isRefreshingPermissions = false;
          });
        } else {
          console.log('Já existe uma atualização de permissões em andamento, aguardando...');
        }
        
        // Para permissões de dashboard, permitir por padrão para evitar loops
        if (permissionId.includes('dashboard.view')) {
          console.log(`[Permissão] ${userRole}.${permissionId}: PERMITINDO acesso ao dashboard para evitar loops`);
          return true;
        }
        
        return false; // Negar acesso até confirmar permissão após atualização
      }
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      // Fallback de segurança - permitir acesso para admins
      return userRole === 'admin';
    }
  }
}

export const permissionsService = new PermissionsService();

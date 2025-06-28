import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/auth.service';
import { permissionsService } from '../services/permissions.service';
import { UserRole } from '../config/permissions';

interface User {
  id: string;
  email: string;
  role: string;
  companyId: string;
  name?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const attemptAutoLogin = async () => {
      console.log('[AuthContext] Attempting auto-login...');
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('[AuthContext] Token from localStorage on load:', token ? 'Token found' : 'No token found');
      
      if (token) {
        console.log('[AuthContext] Token exists, attempting to get profile...');
        try {
          const profileUser = await AuthService.getProfile();
          console.log('[AuthContext] Profile fetched successfully:', profileUser);
          setUser(profileUser);
          localStorage.setItem('user', JSON.stringify(profileUser)); // Atualiza user no localStorage
          
          // Iniciar verificação periódica de permissões
          permissionsService.startPeriodicCheck();
          
          // Carregar permissões durante auto-login
          if (profileUser?.role) {
            console.log('[AuthContext] Carregando permissões para auto-login:', profileUser.role);
            try {
              await permissionsService.ensurePermissionsLoaded(profileUser.role as UserRole);
              console.log('[AuthContext] Permissões carregadas durante auto-login');
            } catch (permError) {
              console.error('[AuthContext] Erro ao carregar permissões durante auto-login:', permError);
              // Não bloqueia o login se houver erro nas permissões
            }
          }
        } catch (error: any) {
          console.error('[AuthContext] Error during getProfile:', error.response?.data || error.message, error);
          // O interceptor de resposta do api.ts já deve lidar com 401 (limpar localStorage e redirecionar)
          // Mas garantimos que o estado local seja limpo.
          AuthService.logout(); // Chama o logout do AuthService para limpar localStorage
          setUser(null);
          console.log('[AuthContext] User set to null due to getProfile error.');
        }
      } else {
        console.log('[AuthContext] No token in localStorage, user remains null.');
      }
      setLoading(false);
      console.log('[AuthContext] Auto-login attempt finished.');
    };

    attemptAutoLogin();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await AuthService.login({ email, password });
      setUser(response.user);
      
      // Iniciar verificação periódica após login bem-sucedido
      permissionsService.startPeriodicCheck();
      
      // Pré-carregar permissões assim que o usuário fizer login
      if (response.user?.role) {
        console.log('[AuthContext] Pré-carregando permissões para:', response.user.role);
        try {
          await permissionsService.ensurePermissionsLoaded(response.user.role as UserRole);
          console.log('[AuthContext] Permissões pré-carregadas com sucesso');
        } catch (permError) {
          console.error('[AuthContext] Erro ao pré-carregar permissões:', permError);
          // Não bloqueia o login se houver erro nas permissões
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Parar a verificação periódica de permissões
    permissionsService.stopPeriodicCheck();
    
    // Limpar dados de autenticação
    AuthService.logout();
    setUser(null);
  };
  
  const updateProfile = async (profileData: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Chamar o serviço de autenticação para atualizar o perfil
      const updatedUser = await AuthService.updateProfile(profileData);
      
      // Atualizar o estado do usuário no contexto
      setUser(prev => prev ? { ...prev, ...updatedUser } : updatedUser);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = () => {
    return !!user && AuthService.isAuthenticated();
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isAuthenticated, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

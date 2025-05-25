import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/auth.service';

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
      setLoading(true);
      const token = localStorage.getItem('token'); // Verifica se existe um token
      if (token) {
        try {
          // Tenta buscar o perfil do usuário para validar o token
          // O interceptor do api.ts já deve adicionar o token ao header
          const profileUser = await AuthService.getProfile();
          setUser(profileUser);
          // Atualiza o usuário no localStorage com os dados mais recentes
          localStorage.setItem('user', JSON.stringify(profileUser));
        } catch (error) {
          // Se getProfile falhar (ex: 401 por token inválido/expirado),
          // o interceptor de resposta do api.ts já deve ter limpado o localStorage
          // e redirecionado para /login. Aqui, apenas garantimos que o estado local seja limpo.
          console.error('Falha ao auto-login, limpando sessão:', error);
          AuthService.logout(); // Garante que o localStorage seja limpo
          setUser(null);
        }
      }
      setLoading(false);
    };

    attemptAutoLogin();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await AuthService.login({ email, password });
      setUser(response.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
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

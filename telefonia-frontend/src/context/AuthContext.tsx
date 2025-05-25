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
    // Verificar se o usuário já está autenticado ao carregar a aplicação
    const storedUser = AuthService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
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

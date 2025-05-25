import api from './api';
import { generateMockUsers } from '../utils/mockData';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'manager' | 'user';
  companyId?: string;
  company?: {
    id: string;
    corporateName: string;
  };
  active: boolean;
  createdAt: string;
  updatedAt: string;
  phone?: string;
  isWhatsapp?: boolean;
  cpf?: string;
  profilePicture?: string;
}

export interface UserFilter {
  role?: string;
  companyId?: string;
  search?: string;
  active?: boolean;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
  role: 'admin' | 'manager' | 'user';
  companyId?: string;
  phone?: string;
  isWhatsapp?: boolean;
  cpf?: string;
  profilePicture?: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  role?: 'admin' | 'manager' | 'user';
  companyId?: string;
  active?: boolean;
  phone?: string;
  isWhatsapp?: boolean;
  cpf?: string;
  profilePicture?: string;
}

const UserService = {
  async getAll(filters?: UserFilter): Promise<User[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.role) params.append('role', filters.role);
      if (filters.companyId) params.append('companyId', filters.companyId);
      if (filters.search) params.append('search', filters.search);
      if (filters.active !== undefined) params.append('active', String(filters.active));
    }
    
    try {
      const response = await api.get<User[]>('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      // Retornar dados simulados em caso de erro
      return generateMockUsers(10);
    }
  },
  
  async getById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },
  
  async create(userData: CreateUserDto): Promise<User> {
    const response = await api.post<User>('/users', userData);
    return response.data;
  },
  
  async update(id: string, userData: UpdateUserDto): Promise<User> {
    const response = await api.patch<User>(`/users/${id}`, userData);
    return response.data;
  },
  
  async deactivate(id: string): Promise<void> {
    await api.patch(`/users/${id}/deactivate`);
  },
  
  async activate(id: string): Promise<void> {
    await api.patch(`/users/${id}/activate`);
  },
  
  async resetPassword(id: string): Promise<{ temporaryPassword: string }> {
    const response = await api.post<{ temporaryPassword: string }>(`/users/${id}/reset-password`);
    return response.data;
  },
  
  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    await api.post(`/users/${id}/change-password`, { oldPassword, newPassword });
  }
};

export default UserService;

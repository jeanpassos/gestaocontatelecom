import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

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

interface AuthResponse {
  user: User;
  access_token: string;
}

export const AuthService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Tentando login com:', credentials);
      
      // Chamar a API de autenticação
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      // Salvar token e dados do usuário no localStorage
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      console.error('Erro detalhado ao fazer login:', error);
      throw error;
    }
  },
  
  async register(userData: any): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    
    // Salvar token e dados do usuário no localStorage
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  },
  
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },
  
  logout(): void {
    // Limpar dados de autenticação
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Limpar permissões para forçar uma nova sincronização no próximo login
    localStorage.removeItem('telefonia_permission_matrix');
    
    console.log('Logout completo: dados de autenticação e permissões removidos');
  },
  
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
  
  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await api.put<{user: User}>('/auth/profile', profileData);
    
    // Atualizar os dados do usuário no localStorage
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...response.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return response.data.user;
  }
};

export default AuthService;

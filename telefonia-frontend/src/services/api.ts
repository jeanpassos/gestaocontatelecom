import axios, { AxiosError, AxiosResponse } from 'axios';

// Configuração da API para o backend NestJS
// Usar o endereço IP completo em vez de localhost para evitar problemas de conexão
export const API_URL = 'http://127.0.0.1:3000';

// Criação da instância do axios com configurações base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Aumentar o timeout para garantir que operações longas não falhem
  timeout: 15000,
});

// Interceptor para adicionar token de autenticação em cada requisição
api.interceptors.request.use(
  (config) => {
    // Obter token do localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Log de erros na preparação da requisição
    console.error('Erro na configuração da requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const { response } = error;
    
    // Se o token expirou, redirecionar para login
    if (response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;

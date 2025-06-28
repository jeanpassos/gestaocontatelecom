// Configuração centralizada da API para o backend NestJS
export const API_URL = 'http://127.0.0.1:3000';

// Configurações adicionais da API
export const API_CONFIG = {
  timeout: 15000,
  defaultHeaders: {
    'Content-Type': 'application/json',
  }
};

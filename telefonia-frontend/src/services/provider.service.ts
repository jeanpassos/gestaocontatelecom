import api from './api';

// Corresponde à entidade ProviderType no backend
export enum ProviderType {
  TELEPHONY = 'telephony',
  INTERNET = 'internet',
  GENERAL = 'general',
}

// Corresponde à entidade Provider no backend
export interface Provider {
  id: string;
  name: string;
  value: string; // Valor único para referência, ex: "vivo_fibra"
  type: ProviderType;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProviderFilter {
  type?: ProviderType;
}

const ProviderService = {
  async getAll(filters?: ProviderFilter): Promise<Provider[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) {
        params.append('type', filters.type);
      }
      const response = await api.get<Provider[]>('/providers', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar operadoras:', error);
      // Retornar um array vazio ou um mock em caso de erro, se apropriado
      return []; 
    }
  },

  async getById(id: string): Promise<Provider> {
    const response = await api.get<Provider>(`/providers/${id}`);
    return response.data;
  },

  async create(providerData: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<Provider> {
    const response = await api.post<Provider>('/providers', providerData);
    return response.data;
  },

  async update(id: string, providerData: Partial<Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Provider> {
    const response = await api.patch<Provider>(`/providers/${id}`, providerData);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/providers/${id}`);
  },
};

export default ProviderService;

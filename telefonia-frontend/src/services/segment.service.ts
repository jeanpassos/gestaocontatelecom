import api from './api';
import { defaultSegments } from '../data/defaultSegments';

export interface Segment {
  id: string;
  name: string;
  value: string;
  createdAt?: string;
  updatedAt?: string;
}

const SegmentService = {
  async getAll(): Promise<Segment[]> {
    try {
      const response = await api.get('/segments');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar segmentos:', error);
      return [];
    }
  },

  async create(segment: Omit<Segment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Segment | null> {
    try {
      const response = await api.post('/segments', segment);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar segmento:', error);
      return null;
    }
  },

  async update(id: string, segment: Partial<Segment>): Promise<Segment | null> {
    try {
      const response = await api.put(`/segments/${id}`, segment);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar segmento:', error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/segments/${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao excluir segmento:', error);
      return false;
    }
  },

  // Importar segmentos padrão
  async importDefaultSegments(): Promise<Segment[]> {
    try {
      const existingSegments = await this.getAll();
      const existingValues = existingSegments.map(s => s.value);
      
      // Filtrar apenas os segmentos que ainda não existem
      const newSegments = defaultSegments.filter(s => !existingValues.includes(s.value));
      
      // Criar os novos segmentos
      const createdSegments: Segment[] = [];
      
      for (const segment of newSegments) {
        const created = await this.create(segment);
        if (created) {
          createdSegments.push(created);
        }
      }
      
      return createdSegments;
    } catch (error) {
      console.error('Erro ao importar segmentos padrão:', error);
      return [];
    }
  }
};

export default SegmentService;

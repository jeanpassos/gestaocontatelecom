import api from './api';
import { generateMockInvoices } from '../utils/mockData';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'canceled';
  provider: 'vivo' | 'claro' | 'tim' | 'oi' | 'other';
  pdfUrl?: string;
  invoiceDetails?: any;
  company: {
    id: string;
    corporateName: string;
  };
  uploadedBy: {
    id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFilter {
  companyId?: string;
  status?: string;
  provider?: string;
  startDate?: string;
  endDate?: string;
}

const InvoiceService = {
  async getAll(filters?: InvoiceFilter): Promise<Invoice[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.companyId) params.append('companyId', filters.companyId);
        if (filters.status) params.append('status', filters.status);
        if (filters.provider) params.append('provider', filters.provider);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
      }
      
      // Adicionar timeout para não esperar muito tempo
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await api.get<Invoice[]>('/invoices', { 
        params,
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
      // Retornar dados simulados em caso de erro
      return generateMockInvoices(20);
    }
  },
  
  async getById(id: string): Promise<Invoice> {
    const response = await api.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },
  
  async create(invoiceData: FormData): Promise<Invoice> {
    const response = await api.post<Invoice>('/invoices', invoiceData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  async uploadPdf(file: File, companyId: string, uploadedById: string, provider: string = 'vivo'): Promise<Invoice> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('companyId', companyId);
    formData.append('uploadedById', uploadedById);
    formData.append('provider', provider);
    
    const response = await api.post<Invoice>('/invoices/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  async update(id: string, invoiceData: Partial<Invoice>): Promise<Invoice> {
    const response = await api.patch<Invoice>(`/invoices/${id}`, invoiceData);
    return response.data;
  },
  
  async delete(id: string): Promise<void> {
    await api.delete(`/invoices/${id}`);
  }
};

export default InvoiceService;

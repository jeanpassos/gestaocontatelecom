import api from './api';
import { generateMockReportData } from '../utils/mockData';

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  companyId?: string;
  provider?: string;
  status?: string;
  type?: 'expense' | 'provider' | 'company' | 'monthly';
  format?: 'pdf' | 'excel' | 'csv';
}

export interface ReportSummary {
  totalInvoices: number;
  totalAmount: number;
  avgAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

export interface ProviderSummary {
  provider: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface MonthlySummary {
  month: string;
  year: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  invoiceCount: number;
}

export interface CompanySummary {
  companyId: string;
  companyName: string;
  totalInvoices: number;
  totalAmount: number;
  avgAmount: number;
}

export interface DetailedReport {
  summary: ReportSummary;
  providerBreakdown: ProviderSummary[];
  monthlyTrend: MonthlySummary[];
  companyBreakdown: CompanySummary[];
}

const ReportService = {
  async getReport(filters: ReportFilter): Promise<DetailedReport> {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.companyId) params.append('companyId', filters.companyId);
    if (filters.provider) params.append('provider', filters.provider);
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    
    try {
      const response = await api.get<DetailedReport>('/reports/detailed', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar relatório detalhado:', error);
      // Retornar dados simulados em caso de erro
      return generateMockReportData();
    }
  },
  
  async exportReport(filters: ReportFilter): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.companyId) params.append('companyId', filters.companyId);
    if (filters.provider) params.append('provider', filters.provider);
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.format) params.append('format', filters.format);
    
    const response = await api.get<Blob>('/reports/export', {
      params,
      responseType: 'blob'
    });
    
    return response.data;
  },
  
  async getMonthlySummary(year: number, companyId?: string): Promise<MonthlySummary[]> {
    const params = new URLSearchParams();
    params.append('year', year.toString());
    if (companyId) params.append('companyId', companyId);
    
    try {
      const response = await api.get<MonthlySummary[]>('/reports/monthly-summary', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar resumo mensal:', error);
      // Retornar dados simulados em caso de erro
      return generateMockReportData().monthlyTrend;
    }
  },
  
  async getProviderBreakdown(
    startDate?: string,
    endDate?: string,
    companyId?: string
  ): Promise<ProviderSummary[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (companyId) params.append('companyId', companyId);
    
    try {
      const response = await api.get<ProviderSummary[]>('/reports/provider-breakdown', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar distribuição por operadora:', error);
      // Retornar dados simulados em caso de erro
      return generateMockReportData().providerBreakdown;
    }
  },
  
  async getCompanyComparison(
    startDate?: string,
    endDate?: string
  ): Promise<CompanySummary[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    try {
      const response = await api.get<CompanySummary[]>('/reports/company-comparison', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar comparativo entre empresas:', error);
      // Retornar dados simulados em caso de erro
      return generateMockReportData().companyBreakdown;
    }
  }
};

export default ReportService;

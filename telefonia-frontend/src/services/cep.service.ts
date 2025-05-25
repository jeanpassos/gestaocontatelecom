import api from './api';
import axios from 'axios';

export interface CEPData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

/**
 * Serviço para consulta de CEP utilizando diferentes provedores
 * Integrado com as configurações do sistema
 */
const CEPService = {
  /**
   * Consulta os dados de um CEP utilizando o provedor configurado nas configurações
   * @param cep CEP a ser consultado (apenas números ou formato 00000-000)
   * @returns Dados do CEP
   */
  async consultarCEP(cep: string): Promise<CEPData | null> {
    try {
      // Remover caracteres não numéricos
      cep = cep.replace(/[^\d]/g, '');
      
      if (cep.length !== 8) {
        throw new Error('CEP deve conter 8 dígitos');
      }
      
      // Obter as configurações do localStorage
      const settingsStr = localStorage.getItem('appSettings');
      const settings = settingsStr ? JSON.parse(settingsStr) : {
        cepApiProvider: 'viacep',
        cepApiKey: '',
        cepUseBackend: true
      };
      
      // Se configurado para usar o backend, fazer a consulta pelo backend
      if (settings.cepUseBackend) {
        try {
          const response = await api.get(`/address/cep/${cep}`);
          if (response.data) {
            return response.data;
          }
        } catch (error) {
          console.error('Erro ao consultar CEP no backend:', error);
          // Se falhar no backend, tentar diretamente na API
        }
      }
      
      // Consultar diretamente na API conforme o provedor configurado
      switch (settings.cepApiProvider) {
        case 'viacep':
          return await this.consultarViaCEP(cep);
        case 'brasilapi':
          return await this.consultarBrasilAPI(cep);
        case 'postmon':
          return await this.consultarPostmon(cep);
        case 'custom':
          // Implementação para API personalizada
          throw new Error('API personalizada não implementada');
        default:
          return await this.consultarViaCEP(cep);
      }
    } catch (error: any) {
      console.error('Erro ao consultar CEP:', error);
      throw error;
    }
  },
  
  /**
   * Consulta o CEP na API ViaCEP
   */
  async consultarViaCEP(cep: string): Promise<CEPData> {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    
    if (response.data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    return response.data;
  },
  
  /**
   * Consulta o CEP na API Brasil API
   */
  async consultarBrasilAPI(cep: string): Promise<CEPData> {
    const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${cep}`);
    
    // Adaptar o formato da resposta para o padrão do ViaCEP
    return {
      cep: response.data.cep,
      logradouro: response.data.street || '',
      complemento: '',
      bairro: response.data.neighborhood || '',
      localidade: response.data.city || '',
      uf: response.data.state || '',
      ibge: response.data.city_ibge || '',
      gia: '',
      ddd: response.data.ddd || '',
      siafi: ''
    };
  },
  
  /**
   * Consulta o CEP na API Postmon
   */
  async consultarPostmon(cep: string): Promise<CEPData> {
    const response = await axios.get(`https://api.postmon.com.br/v1/cep/${cep}`);
    
    // Adaptar o formato da resposta para o padrão do ViaCEP
    return {
      cep: response.data.cep,
      logradouro: response.data.logradouro || '',
      complemento: response.data.complemento || '',
      bairro: response.data.bairro || '',
      localidade: response.data.cidade || '',
      uf: response.data.estado || '',
      ibge: response.data.cidade_info?.codigo_ibge || '',
      gia: '',
      ddd: response.data.cidade_info?.ddd || '',
      siafi: ''
    };
  },
  
  /**
   * Retorna dados simulados de CEP para desenvolvimento
   */
  getMockCEPData(cep: string): CEPData {
    return {
      cep: cep.replace(/(\d{5})(\d{3})/, '$1-$2'),
      logradouro: 'Avenida Brasil',
      complemento: '',
      bairro: 'Centro',
      localidade: 'São Paulo',
      uf: 'SP',
      ibge: '3550308',
      gia: '1004',
      ddd: '11',
      siafi: '7107'
    };
  }
};

export default CEPService;

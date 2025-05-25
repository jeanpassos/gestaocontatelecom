import axios from 'axios';
import api from './api';

export interface CNPJData {
  cnpj: string;
  nome: string;
  fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  email: string;
  telefone: string;
  situacao: string;
  data_situacao: string;
  abertura: string;
  tipo: string;
  capital_social: string;
  natureza_juridica: string;
  atividade_principal: Array<{
    code: string;
    text: string;
  }>;
  atividades_secundarias: Array<{
    code: string;
    text: string;
  }>;
  qsa: Array<{
    nome: string;
    qual: string;
  }>;
  status: string;
  ultima_atualizacao: string;
  efr: string;
  motivo_situacao: string;
  situacao_especial: string;
  data_situacao_especial: string;
}

const CNPJService = {
  /**
   * Consulta os dados de um CNPJ na API do ReceitaWS
   * @param cnpj CNPJ a ser consultado (apenas números)
   * @returns Dados do CNPJ
   */
  async consultarCNPJ(cnpj: string): Promise<CNPJData | null> {
    try {
      console.log('Iniciando consulta de CNPJ:', cnpj);
      // Remover caracteres não numéricos
      cnpj = cnpj.replace(/[^\d]/g, '');
      console.log('CNPJ formatado:', cnpj);
      
      if (cnpj.length !== 14) {
        throw new Error('CNPJ deve conter 14 dígitos');
      }
      
      // IMPORTANTE: Para fins de desenvolvimento, retornar dados simulados
      // para testar a funcionalidade sem depender de APIs externas
      // Remova este bloco em produção
      // console.log('Usando dados simulados para desenvolvimento');
      // return this.getMockCNPJData(cnpj); // Comentado

      // Agora, chamamos diretamente nosso backend, que lidará com a API externa.
      console.log('Consultando CNPJ através do backend...');
      const response = await api.get(`/companies/cnpj/${cnpj}`);
      // O backend deve retornar os dados no formato CNPJData ou um erro.
      // Se o backend retornar um erro (ex: 404 se não encontrar, 500 se a API externa falhar),
      // o interceptor do axios em './api' ou o catch abaixo deve lidar com isso.
      console.log('Dados do CNPJ recebidos do backend:', response.data);
      return response.data; // Assumindo que o backend retorna os dados no formato CNPJData

    } catch (error: any) {
      console.error('Erro ao consultar CNPJ via backend:', error.response?.data || error.message, error);
      // Opcional: retornar null ou um objeto de erro específico em vez de relançar,
      // para que o componente possa tratar o erro de forma mais amigável.
      // Por enquanto, relançar para vermos o erro completo no console.
      throw error; 
    }
  },
  
  /**
   * Adapta os dados da API alternativa para o formato padrão
   */
  adaptAlternativeApiData(data: any): CNPJData {
    return {
      cnpj: data.cnpj || '',
      nome: data.razao_social || data.nome || '',
      fantasia: data.nome_fantasia || '',
      logradouro: data.logradouro || data.endereco?.logradouro || '',
      numero: data.numero || data.endereco?.numero || '',
      complemento: data.complemento || data.endereco?.complemento || '',
      bairro: data.bairro || data.endereco?.bairro || '',
      municipio: data.municipio || data.cidade || data.endereco?.municipio || '',
      uf: data.uf || data.estado || data.endereco?.uf || '',
      cep: data.cep || data.endereco?.cep || '',
      email: data.email || '',
      telefone: data.telefone || '',
      situacao: data.situacao || 'ATIVA',
      data_situacao: data.data_situacao || '',
      abertura: data.data_abertura || data.abertura || '',
      tipo: data.tipo || 'MATRIZ',
      capital_social: data.capital_social || '',
      natureza_juridica: data.natureza_juridica || '',
      atividade_principal: Array.isArray(data.atividade_principal) ? data.atividade_principal : [
        {
          code: data.cnae_principal || '',
          text: data.atividade_principal_descricao || ''
        }
      ],
      atividades_secundarias: Array.isArray(data.atividades_secundarias) ? data.atividades_secundarias : [],
      qsa: Array.isArray(data.qsa) ? data.qsa : [],
      status: 'OK',
      ultima_atualizacao: data.ultima_atualizacao || '',
      efr: data.efr || '',
      motivo_situacao: data.motivo_situacao || '',
      situacao_especial: data.situacao_especial || '',
      data_situacao_especial: data.data_situacao_especial || ''
    };
  },

  /**
   * Adapta os dados de uma empresa do backend para o formato da API de CNPJ
   */
  adaptCompanyToCNPJData(company: any): CNPJData {
    return {
      cnpj: company.cnpj,
      nome: company.corporateName,
      fantasia: company.tradeName || '',
      logradouro: company.address?.street || '',
      numero: company.address?.number || '',
      complemento: company.address?.complement || '',
      bairro: company.address?.district || '',
      municipio: company.address?.city || '',
      uf: company.address?.state || '',
      cep: company.address?.zipCode || '',
      email: company.manager?.email || '',
      telefone: company.manager?.phone || '',
      situacao: 'ATIVA',
      data_situacao: '',
      abertura: '',
      tipo: company.type === 'headquarters' ? 'MATRIZ' : 'FILIAL',
      capital_social: '',
      natureza_juridica: '',
      atividade_principal: [],
      atividades_secundarias: [],
      qsa: [],
      status: 'OK',
      ultima_atualizacao: '',
      efr: '',
      motivo_situacao: '',
      situacao_especial: '',
      data_situacao_especial: ''
    };
  },
  
  /**
   * Retorna dados simulados de CNPJ para desenvolvimento
   * Gera dados mais realistas com base no CNPJ informado
   */
  getMockCNPJData(cnpj: string): CNPJData {
    // Usar os últimos dígitos do CNPJ para gerar dados diferentes
    const lastDigits = cnpj.slice(-4);
    const num = parseInt(lastDigits, 10);
    
    // Lista de nomes de empresas para simulação
    const empresas = [
      { nome: 'TECNOLOGIA AVANÇADA LTDA', fantasia: 'TECNOPLUS' },
      { nome: 'COMÉRCIO DIGITAL S.A.', fantasia: 'DIGISHOP' },
      { nome: 'CONSULTORIA EMPRESARIAL LTDA', fantasia: 'CONSULT PRO' },
      { nome: 'SOLUÇÕES INTEGRADAS S.A.', fantasia: 'INTEGRA TECH' },
      { nome: 'DESENVOLVIMENTO WEB LTDA', fantasia: 'WEBDEV' }
    ];
    
    // Lista de cidades para simulação
    const cidades = [
      { municipio: 'São Paulo', uf: 'SP', cep: '01310-100' },
      { municipio: 'Rio de Janeiro', uf: 'RJ', cep: '20031-170' },
      { municipio: 'Belo Horizonte', uf: 'MG', cep: '30130-110' },
      { municipio: 'Porto Alegre', uf: 'RS', cep: '90010-280' },
      { municipio: 'Curitiba', uf: 'PR', cep: '80010-010' }
    ];
    
    // Lista de bairros para simulação
    const bairros = ['Centro', 'Jardim Paulista', 'Boa Viagem', 'Barra da Tijuca', 'Funcionários'];
    
    // Lista de logradouros para simulação
    const logradouros = ['Avenida Paulista', 'Rua Augusta', 'Avenida Brasil', 'Rua da Consolação', 'Avenida Atlântica'];
    
    // Selecionar dados com base no CNPJ
    const empresaIndex = num % empresas.length;
    const cidadeIndex = (num + 1) % cidades.length;
    const bairroIndex = (num + 2) % bairros.length;
    const logradouroIndex = (num + 3) % logradouros.length;
    
    // Gerar número aleatório para o endereço
    const numero = (num % 1000 + 100).toString();
    
    return {
      cnpj: cnpj,
      nome: empresas[empresaIndex].nome,
      fantasia: empresas[empresaIndex].fantasia,
      logradouro: logradouros[logradouroIndex],
      numero: numero,
      complemento: `Sala ${num % 900 + 100}`,
      bairro: bairros[bairroIndex],
      municipio: cidades[cidadeIndex].municipio,
      uf: cidades[cidadeIndex].uf,
      cep: cidades[cidadeIndex].cep,
      email: `contato@${empresas[empresaIndex].fantasia.toLowerCase().replace(/\s/g, '')}.com.br`,
      telefone: `(${(num % 90) + 10}) ${9}${(num % 9000) + 1000}-${(num % 9000) + 1000}`,
      situacao: 'ATIVA',
      data_situacao: '01/01/2020',
      abertura: '01/01/2010',
      tipo: num % 2 === 0 ? 'MATRIZ' : 'FILIAL',
      capital_social: ((num % 900) + 100) * 1000 + '.00',
      natureza_juridica: '206-2 - Sociedade Empresária Limitada',
      atividade_principal: [{
        code: '6201-5/01',
        text: 'Desenvolvimento de programas de computador sob encomenda'
      }],
      atividades_secundarias: [{
        code: '6202-3/00',
        text: 'Desenvolvimento e licenciamento de programas de computador customizáveis'
      }],
      qsa: [{
        nome: 'João da Silva',
        qual: 'Sócio-Administrador'
      }],
      status: 'OK',
      ultima_atualizacao: '2023-01-01T10:00:00.000Z',
      efr: '',
      motivo_situacao: '',
      situacao_especial: '',
      data_situacao_especial: ''
    };
  }
};

export default CNPJService;

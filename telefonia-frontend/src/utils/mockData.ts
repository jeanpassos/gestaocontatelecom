// Arquivo para geração de dados simulados para modo offline
import { v4 as uuidv4 } from 'uuid';

// Interfaces
interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  companyId?: string;
  company?: {
    id: string;
    corporateName: string;
  };
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MockCompany {
  id: string;
  corporateName: string;
  tradeName: string;
  cnpj: string;
  type?: 'matriz' | 'filial';
  provider?: 'vivo' | 'claro' | 'tim' | 'oi' | 'other';
  contractDate?: string;
  renewalDate?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  manager?: {
    name?: string;
    email?: string;
    phone?: string;
    hasWhatsapp?: boolean;
  };
  phoneLines: string[];
  assets: Record<string, any>;
  observation?: string;
  createdAt: string;
  updatedAt: string;
}

interface MockInvoice {
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

// Dados base para geração aleatória
const companyNames = [
  'TechSolutions Ltda',
  'Inovação Digital S.A.',
  'Conecta Telecom',
  'Grupo Empresarial Brasil',
  'Indústrias Unidas',
  'Comércio Expresso',
  'Serviços Integrados',
  'Consultoria Empresarial',
  'Transportes Rápidos',
  'Construções Modernas'
];

const providers = ['vivo', 'claro', 'tim', 'oi', 'other'] as const;
const statuses = ['pending', 'paid', 'overdue', 'canceled'] as const;
const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Curitiba', 'Porto Alegre', 'Salvador', 'Recife'];
const states = ['SP', 'RJ', 'MG', 'DF', 'PR', 'RS', 'BA', 'PE'];

// Funções auxiliares
const randomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0]; // Retorna apenas a data no formato YYYY-MM-DD
};

const randomAmount = (min: number, max: number) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

const randomElement = <T>(array: readonly T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const randomCNPJ = () => {
  const n1 = Math.floor(Math.random() * 10);
  const n2 = Math.floor(Math.random() * 10);
  const n3 = Math.floor(Math.random() * 10);
  const n4 = Math.floor(Math.random() * 10);
  const n5 = Math.floor(Math.random() * 10);
  const n6 = Math.floor(Math.random() * 10);
  const n7 = Math.floor(Math.random() * 10);
  const n8 = Math.floor(Math.random() * 10);
  return `${n1}${n2}.${n3}${n4}${n5}.${n6}${n7}${n8}/0001-${Math.floor(Math.random() * 90) + 10}`;
};

// Geração de empresas simuladas
export const generateMockCompanies = (count: number): MockCompany[] => {
  const companies: MockCompany[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = uuidv4();
    const corporateName = companyNames[i % companyNames.length];
    const tradeName = corporateName.split(' ')[0];
    
    // Gerar números de telefone aleatórios para a empresa
    const phoneLineCount = Math.floor(Math.random() * 5) + 1;
    const phoneLines = [];
    for (let j = 0; j < phoneLineCount; j++) {
      phoneLines.push(`(${Math.floor(Math.random() * 90) + 10}) ${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 9000) + 1000}`);
    }
    
    // Gerar ativos aleatórios para a empresa
    const mobileDeviceCount = Math.floor(Math.random() * 3);
    const mobileDevices = [];
    
    // Modelos de celulares para dados mockados
    const mobileModels = ['iPhone 13', 'Samsung Galaxy S21', 'Xiaomi Mi 11', 'Motorola Edge 20', 'Google Pixel 6'];
    const peopleNames = ['João Silva', 'Maria Oliveira', 'Pedro Santos', 'Ana Costa', 'Carlos Pereira'];
    
    // Gerar aparelhos celulares
    for (let j = 0; j < mobileDeviceCount; j++) {
      const hasAssignment = Math.random() > 0.3;
      const hasPhoneLine = Math.random() > 0.5;
      
      mobileDevices.push({
        model: randomElement(mobileModels),
        assignedTo: hasAssignment ? randomElement(peopleNames) : '',
        assignedDate: hasAssignment ? randomDate(new Date(2022, 0, 1), new Date()) : null,
        phoneLine: hasPhoneLine && phoneLines.length > 0 ? randomElement(phoneLines) : null
      });
    }
    
    // Estrutura de assets com aparelhos celulares
    const assets = {
      computers: Math.floor(Math.random() * 50) + 10,
      phones: Math.floor(Math.random() * 30) + 5,
      vehicles: Math.floor(Math.random() * 10) + 1,
      buildings: Math.floor(Math.random() * 3) + 1,
      mobileDevices: mobileDevices
    };
    
    // Gerar tipos aleatórios e operadoras
    const types: Array<'matriz' | 'filial'> = ['matriz', 'filial'];
    const providers: Array<'vivo' | 'claro' | 'tim' | 'oi' | 'other'> = ['vivo', 'claro', 'tim', 'oi', 'other'];
    
    // Gerar endereço estruturado
    const address = {
      street: `Rua ${Math.floor(Math.random() * 1000)}`,
      number: `${Math.floor(Math.random() * 1000)}`,
      complement: Math.random() > 0.5 ? `Sala ${Math.floor(Math.random() * 100)}` : '',
      district: `Bairro ${Math.floor(Math.random() * 50)}`,
      city: randomElement(cities),
      state: randomElement(states),
      zipCode: `${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 900) + 100}`
    };
    
    // Gerar informações do gestor
    const manager = {
      name: `Gestor ${i + 1}`,
      email: `gestor${i + 1}@${tradeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br`,
      phone: `(${Math.floor(Math.random() * 90) + 10}) ${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 9000) + 1000}`,
      hasWhatsapp: Math.random() > 0.3
    };
    
    companies.push({
      id,
      corporateName,
      tradeName,
      cnpj: randomCNPJ(),
      type: Math.random() > 0.7 ? randomElement(types) : undefined,
      provider: Math.random() > 0.3 ? randomElement(providers) : undefined,
      contractDate: Math.random() > 0.3 ? randomDate(new Date(2020, 0, 1), new Date(2022, 0, 1)) : undefined,
      renewalDate: Math.random() > 0.3 ? randomDate(new Date(2023, 0, 1), new Date(2024, 11, 31)) : undefined,
      address,
      manager,
      phoneLines,
      assets,
      observation: Math.random() > 0.5 ? randomElement([
        "Cliente VIP com desconto especial de 15% em novos serviços.",
        "Empresa com histórico de pagamentos em dia.",
        "Contrato renovado com condições especiais em 2023.",
        "Cliente com potencial para expansão de serviços.",
        "Necessita de atenção especial no atendimento.",
        "Empresa em processo de expansão para novas filiais.",
        "Histórico de problemas técnicos recorrentes.",
        "Cliente estratégico para o setor de telecomunicações."
      ]) : undefined,
      createdAt: randomDate(new Date(2020, 0, 1), new Date(2022, 0, 1)),
      updatedAt: randomDate(new Date(2022, 0, 1), new Date())
    });
  }
  
  return companies;
};

// Geração de faturas simuladas
export const generateMockInvoices = (count: number): MockInvoice[] => {
  const companies = generateMockCompanies(10);
  const invoices: MockInvoice[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = uuidv4();
    const company = companies[Math.floor(Math.random() * companies.length)];
    const dueDate = randomDate(new Date(2023, 0, 1), new Date(2023, 11, 31));
    const status = randomElement(statuses);
    const provider = randomElement(providers);
    
    invoices.push({
      id,
      invoiceNumber: `INV-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
      amount: randomAmount(100, 5000),
      dueDate,
      paymentDate: status === 'paid' ? randomDate(new Date(dueDate), new Date()) : undefined,
      status,
      provider,
      pdfUrl: Math.random() > 0.3 ? `https://example.com/invoices/${id}.pdf` : undefined,
      company: {
        id: company.id,
        corporateName: company.corporateName
      },
      uploadedBy: {
        id: '1',
        email: 'admin@example.com'
      },
      createdAt: randomDate(new Date(2023, 0, 1), new Date()),
      updatedAt: randomDate(new Date(2023, 0, 1), new Date())
    });
  }
  
  return invoices;
};

// Geração de usuários simulados
export function generateMockUsers(count: number): MockUser[] {
  const users: MockUser[] = [];
  const companies = generateMockCompanies(5);
  const domains = ['gmail.com', 'outlook.com', 'hotmail.com', 'empresa.com.br', 'tech.net'];
  const firstNames = ['Ana', 'João', 'Maria', 'Pedro', 'Carlos', 'Fernanda', 'Ricardo', 'Juliana', 'Roberto', 'Camila'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Lima'];
  
  const roles: Array<'admin' | 'manager' | 'user'> = ['admin', 'manager', 'user'];
  
  for (let i = 0; i < count; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomElement(domains)}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const role = randomElement(roles);
    const isActive = Math.random() > 0.2; // 80% chance of being active
    
    // Managers and users are associated with companies, admins are not
    let companyId = undefined;
    let company = undefined;
    
    if (role !== 'admin') {
      const randomCompany = randomElement(companies);
      companyId = randomCompany.id;
      company = {
        id: randomCompany.id,
        corporateName: randomCompany.corporateName
      };
    }
    
    const createdAt = randomDate(new Date(2023, 0, 1), new Date());
    const updatedAt = randomDate(new Date(createdAt), new Date());
    
    users.push({
      id: uuidv4(),
      email,
      name,
      role,
      companyId,
      company,
      active: isActive,
      createdAt,
      updatedAt
    });
  }
  
  // Garantir que exista pelo menos um admin ativo
  const hasAdmin = users.some(user => user.role === 'admin' && user.active);
  if (!hasAdmin) {
    users[0] = {
      id: uuidv4(),
      email: 'admin@example.com',
      name: 'Administrador',
      role: 'admin',
      active: true,
      createdAt: new Date(2023, 0, 1).toString(),
      updatedAt: new Date().toString()
    };
  }
  
  return users;
}

// Geração de dados para relatórios
export function generateMockReportData() {
  const providers = ['vivo', 'claro', 'tim', 'oi', 'other'];
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentYear = new Date().getFullYear();
  
  // Resumo geral
  const totalInvoices = Math.floor(Math.random() * 100) + 50;
  const totalAmount = randomAmount(50000, 200000);
  const paidAmount = randomAmount(30000, 150000);
  const pendingAmount = randomAmount(10000, 50000);
  const overdueAmount = randomAmount(5000, 20000);
  const avgAmount = totalAmount / totalInvoices;
  
  // Dados mensais formatados para o serviço de relatórios
  const monthlyTrend = months.map((month, index) => {
    const totalMonthAmount = randomAmount(5000, 15000);
    const paidMonthAmount = randomAmount(3000, totalMonthAmount * 0.8);
    const pendingMonthAmount = randomAmount(1000, totalMonthAmount * 0.3);
    const overdueMonthAmount = totalMonthAmount - paidMonthAmount - pendingMonthAmount;
    
    return {
      month,
      year: currentYear,
      totalAmount: totalMonthAmount,
      paidAmount: paidMonthAmount,
      pendingAmount: pendingMonthAmount,
      overdueAmount: overdueMonthAmount,
      invoiceCount: Math.floor(Math.random() * 20) + 5
    };
  });
  
  // Dados por operadora formatados para o serviço de relatórios
  const providerBreakdown = providers.map(provider => {
    const count = Math.floor(Math.random() * 30) + 10;
    const totalAmount = randomAmount(10000, 50000);
    const percentage = Math.random() * 0.5 + 0.1; // 10% a 60%
    
    return {
      provider,
      count,
      totalAmount,
      percentage
    };
  });
  
  // Normalizar as porcentagens para somar 100%
  const totalPercentage = providerBreakdown.reduce((sum, item) => sum + item.percentage, 0);
  providerBreakdown.forEach(item => {
    item.percentage = item.percentage / totalPercentage;
  });
  
  // Dados por empresa formatados para o serviço de relatórios
  const companyBreakdown = generateMockCompanies(5).map(company => {
    const totalInvoices = Math.floor(Math.random() * 30) + 5;
    const totalAmount = randomAmount(5000, 30000);
    
    return {
      companyId: company.id,
      companyName: company.corporateName,
      totalInvoices,
      totalAmount,
      avgAmount: totalAmount / totalInvoices
    };
  });
  
  // Retornar no formato esperado pelo serviço de relatórios
  return {
    summary: {
      totalInvoices,
      totalAmount,
      avgAmount,
      paidAmount,
      pendingAmount,
      overdueAmount
    },
    providerBreakdown,
    monthlyTrend,
    companyBreakdown
  };
};

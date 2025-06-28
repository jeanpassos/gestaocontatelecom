import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Avatar,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Button
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Phone as PhoneIcon,
  Receipt as ReceiptIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AppleLayout from '../../components/Layout/AppleLayout';
import { useAuth } from '../../context/AuthContext';
import CompanyService, { Company } from '../../services/company.service';
import InvoiceService, { Invoice } from '../../services/invoice.service';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

// Dados simulados para os gráficos
const providerData = [
  { name: 'Jan', Vivo: 4000, Claro: 2400, Tim: 2400, Oi: 1200 },
  { name: 'Fev', Vivo: 3000, Claro: 1398, Tim: 2210, Oi: 900 },
  { name: 'Mar', Vivo: 2000, Claro: 9800, Tim: 2290, Oi: 1700 },
  { name: 'Abr', Vivo: 2780, Claro: 3908, Tim: 2000, Oi: 1500 },
  { name: 'Mai', Vivo: 1890, Claro: 4800, Tim: 2181, Oi: 1200 },
  { name: 'Jun', Vivo: 2390, Claro: 3800, Tim: 2500, Oi: 1400 },
  { name: 'Jul', Vivo: 3490, Claro: 4300, Tim: 2100, Oi: 1800 },
];

// Paleta de cores mais diversificada para os gráficos
const COLORS = {
  // Cores primárias para as operadoras
  VIVO: '#1976D2',  // Azul
  CLARO: '#9C27B0', // Roxo
  TIM: '#E91E63',   // Rosa
  OI: '#FF9800',    // Laranja
  
  // Cores secundárias para detalhes
  SUCCESS: '#2E7D32',  // Verde escuro
  WARNING: '#ED6C02',  // Laranja
  ERROR: '#D32F2F',    // Vermelho
  INFO: '#0288D1'      // Azul claro
};

const pieData = [
  { name: 'Vivo', value: 17550, color: COLORS.VIVO },
  { name: 'Claro', value: 26404, color: COLORS.CLARO },
  { name: 'Tim', value: 15681, color: COLORS.TIM },
  { name: 'Oi', value: 9700, color: COLORS.OI },
];

// Componente de estatística com estilo Apple
const StatCard = ({ icon, title, value, change, color }: any) => {
  const theme = useTheme();
  const isPositive = change > 0;
  
  return (
    <Card 
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: '16px',
        background: theme.palette.background.paper,
        border: '1px solid rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
        },
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      <Box sx={{ 
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: color,
              color: '#fff',
            }}
          >
            {icon}
          </Box>
          
          <Box sx={{ ml: 'auto' }}>
            {change !== undefined && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '12px',
                  backgroundColor: isPositive ? 'success.main' : 'error.main',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                {isPositive ? '+' : ''}{change}%
              </Box>
            )}
          </Box>
        </Box>
        
        <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5, fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
          {value}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif' }}>
          {title}
        </Typography>
      </Box>
    </Card>
  );
};

// Componente de item de fatura com estilo Apple
const InvoiceItem = ({ invoice, formatCurrency }: any) => {
  const theme = useTheme();
  const isPaid = invoice.status === 'paid';
  const isOverdue = invoice.status === 'overdue';
  
  return (
    <Box 
      sx={{ 
        p: 2, 
        mb: 1, 
        borderRadius: '12px',
        backgroundColor: theme.palette.background.paper,
        border: '1px solid rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
        fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      <Avatar 
        sx={{ 
          width: 42, 
          height: 42,
          bgcolor: invoice.provider === 'Vivo' ? COLORS.VIVO :
                  invoice.provider === 'Claro' ? COLORS.CLARO :
                  invoice.provider === 'Tim' ? COLORS.TIM :
                  invoice.provider === 'Oi' ? COLORS.OI : '#999999',
        }}
      >
        {invoice.provider?.charAt(0) || 'T'}
      </Avatar>
      
      <Box sx={{ ml: 2, flex: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif' }}>
          {invoice.invoiceNumber || `Fatura ${invoice.id}`}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif' }}>
          {invoice.company?.corporateName || 'Empresa não especificada'}
        </Typography>
      </Box>
      
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif' }}>
          {formatCurrency(invoice.amount)}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: isPaid ? 'success.main' : isOverdue ? 'error.main' : 'warning.main',
            fontWeight: 500,
            fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif'
          }}
        >
          {isPaid ? 'Pago' : isOverdue ? 'Atrasado' : 'Pendente'}
        </Typography>
      </Box>
    </Box>
  );
};

const AppleDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
    totalPendingAmount: 0
  });

  // Usando a nova paleta de cores para o dashboard
  const primaryColor = COLORS.VIVO;
  const secondaryColor = COLORS.CLARO;
  const accentColor = COLORS.TIM;
  const highlightColor = COLORS.OI;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Dados simulados para demonstração (modo offline)
        const mockCompanies = [
          { id: '1', corporateName: 'Empresa ABC Ltda', cnpj: '12.345.678/0001-90', phoneLines: 12, active: true },
          { id: '2', corporateName: 'XYZ Tecnologia S.A.', cnpj: '98.765.432/0001-10', phoneLines: 8, active: true },
          { id: '3', corporateName: 'Consultoria 123', cnpj: '45.678.901/0001-23', phoneLines: 5, active: true },
          { id: '4', corporateName: 'Distribuidora JKL', cnpj: '23.456.789/0001-45', phoneLines: 15, active: true },
          { id: '5', corporateName: 'Indústria MNO', cnpj: '34.567.890/0001-56', phoneLines: 10, active: true },
        ];
        
        const mockInvoices = [
          { id: '1', invoiceNumber: 'FAT-001', amount: 1290.50, provider: 'Vivo', status: 'paid', company: mockCompanies[0], dueDate: '2025-05-10', paymentDate: '2025-05-08' },
          { id: '2', invoiceNumber: 'FAT-002', amount: 852.30, provider: 'Claro', status: 'pending', company: mockCompanies[1], dueDate: '2025-05-15' },
          { id: '3', invoiceNumber: 'FAT-003', amount: 435.90, provider: 'Tim', status: 'overdue', company: mockCompanies[2], dueDate: '2025-05-05' },
          { id: '4', invoiceNumber: 'FAT-004', amount: 1756.40, provider: 'Vivo', status: 'pending', company: mockCompanies[3], dueDate: '2025-05-20' },
          { id: '5', invoiceNumber: 'FAT-005', amount: 923.75, provider: 'Oi', status: 'paid', company: mockCompanies[4], dueDate: '2025-05-12', paymentDate: '2025-05-10' },
          { id: '6', invoiceNumber: 'FAT-006', amount: 1105.60, provider: 'Claro', status: 'pending', company: mockCompanies[0], dueDate: '2025-05-25' },
          { id: '7', invoiceNumber: 'FAT-007', amount: 678.20, provider: 'Tim', status: 'paid', company: mockCompanies[1], dueDate: '2025-05-08', paymentDate: '2025-05-07' },
          { id: '8', invoiceNumber: 'FAT-008', amount: 1450.00, provider: 'Vivo', status: 'overdue', company: mockCompanies[2], dueDate: '2025-05-02' },
        ];
        
        // Tentar buscar dados reais do backend
        try {
          // Timeout de 3 segundos para evitar espera longa
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 3000)
          );
          
          const [companiesData, invoicesData] = await Promise.race([
            Promise.all([
              CompanyService.getAll(),
              InvoiceService.getAll()
            ]),
            timeoutPromise
          ]) as [Company[], Invoice[]];
          
          if (companiesData && companiesData.length > 0) {
            setCompanies(companiesData);
          } else {
            setCompanies(mockCompanies as any);
          }
          
          if (invoicesData && invoicesData.length > 0) {
            setInvoices(invoicesData);
          } else {
            setInvoices(mockInvoices as any);
          }
        } catch (err) {
          console.log('Usando dados simulados devido a erro de conexão:', err);
          setCompanies(mockCompanies as any);
          setInvoices(mockInvoices as any);
          setError('Usando dados simulados. O backend não está disponível no momento.');
        }
        
        // Calcular estatísticas com os dados disponíveis (reais ou simulados)
        const pending = invoices.filter(inv => !inv.paymentDate);
        const pendingAmount = pending.reduce((sum, inv) => sum + inv.amount, 0);
        
        setStats({
          totalCompanies: companies.length,
          totalInvoices: invoices.length,
          pendingInvoices: pending.length,
          totalPendingAmount: pendingAmount || 12450.75
        });
      } catch (err) {
        console.error('Erro ao processar dados:', err);
        setError('Falha ao processar dados. Usando modo offline com dados simulados.');
        
        // Dados simulados para demonstração em caso de erro crítico
        setCompanies([]);
        setInvoices([]);
        setStats({
          totalCompanies: 5,
          totalInvoices: 24,
          pendingInvoices: 8,
          totalPendingAmount: 12450.75
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };



  // Conteúdo principal
  const mainContent = (
    <Box sx={{ 
      p: { xs: 2, md: 3 },
      backgroundColor: '#f5f5f7',
      minHeight: '100vh',
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Cabeçalho */}
      <Box sx={{ 
        mb: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif' }}>
            Olá, {user?.email?.split('@')[0] || 'Usuário'}! Bem-vindo ao seu painel de controle.
          </Typography>
        </Box>
      </Box>
      
      {/* Indicador de carregamento */}
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '200px'
        }}>
          <CircularProgress sx={{ color: primaryColor }} />
        </Box>
      ) : (
        <>
          {/* Mensagem de erro */}
          {error && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                mb: 3, 
                borderRadius: '12px',
                backgroundColor: theme.palette.error.light,
                color: theme.palette.error.dark,
                border: `1px solid ${theme.palette.error.light}`
              }}
            >
              <Typography variant="body2" sx={{ fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif' }}>{error}</Typography>
            </Paper>
          )}
          
          {/* Cards de estatísticas */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<ReceiptIcon />}
                title="Total de Faturas"
                value={stats.totalInvoices}
                change={12}
                color={COLORS.VIVO}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<BusinessIcon />}
                title="Contratos"
                value={stats.totalCompanies}
                change={0}
                color={COLORS.CLARO}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<PhoneIcon />}
                title="Linhas Ativas"
                value={42}
                change={5}
                color={COLORS.TIM}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<TrendingUpIcon />}
                title="Valor Pendente"
                value={formatCurrency(stats.totalPendingAmount)}
                change={-5}
                color={COLORS.OI}
              />
            </Grid>
          </Grid>
          
          {/* Gráficos */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  backgroundColor: theme.palette.background.paper,
                  height: '100%',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Pagamentos por Operadora
                </Typography>
                
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={providerData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="Vivo" stackId="1" stroke={COLORS.VIVO} fill={`${COLORS.VIVO}CC`} />
                    <Area type="monotone" dataKey="Claro" stackId="1" stroke={COLORS.CLARO} fill={`${COLORS.CLARO}CC`} />
                    <Area type="monotone" dataKey="Tim" stackId="1" stroke={COLORS.TIM} fill={`${COLORS.TIM}CC`} />
                    <Area type="monotone" dataKey="Oi" stackId="1" stroke={COLORS.OI} fill={`${COLORS.OI}CC`} />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  backgroundColor: theme.palette.background.paper,
                  height: '100%',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Distribuição por Operadora
                </Typography>
                
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Faturas Recentes e Análise */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  backgroundColor: theme.palette.background.paper,
                  height: '100%',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 3
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Faturas Recentes
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ 
                      borderRadius: '20px', 
                      color: primaryColor, 
                      borderColor: primaryColor,
                      '&:hover': {
                        borderColor: accentColor,
                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                      },
                      fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
                      textTransform: 'none'
                    }}
                  >
                    Ver todas
                  </Button>
                </Box>
                
                <Box>
                  {/* Exibir faturas reais ou simuladas */}
                  {invoices.slice(0, 3).map((invoice) => (
                    <InvoiceItem 
                      key={invoice.id}
                      invoice={invoice}
                      formatCurrency={formatCurrency} 
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  backgroundColor: theme.palette.background.paper,
                  height: '100%',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Análise de Gastos por Operadora
                </Typography>
                
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={providerData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="Vivo" fill={COLORS.VIVO} />
                    <Bar dataKey="Claro" fill={COLORS.CLARO} />
                    <Bar dataKey="Tim" fill={COLORS.TIM} />
                    <Bar dataKey="Oi" fill={COLORS.OI} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );

  return (
    <AppleLayout>
      {mainContent}
    </AppleLayout>
  );
};

export default AppleDashboard;

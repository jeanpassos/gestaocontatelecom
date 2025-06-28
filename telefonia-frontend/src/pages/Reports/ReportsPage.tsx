import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  Tooltip,
  IconButton,
  Alert,
  useTheme,
  InputAdornment
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  InsertDriveFile as FileIcon,
  CalendarMonth as CalendarIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import AppleLayout from '../../components/Layout/AppleLayout';
import { useAuth } from '../../context/AuthContext';
import ReportService, {
  DetailedReport,
  ReportFilter,
  ProviderSummary,
  MonthlySummary
} from '../../services/report.service';
import CompanyService, { Company } from '../../services/company.service';

// Interface para controle de tabs
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Componente de painel de tab
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

// Funções auxiliares para formatação
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};

// Componente de estatística
const StatCard = ({ title, value, subtitle, icon, color }: any) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              color: `${color}.main`,
              borderRadius: '12px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 'auto' }}>
            {subtitle}
          </Typography>
        </Box>
        
        <Typography variant="h4" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
          {value}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Componente para filtros
const FilterPanel = ({ 
  companies, 
  filters, 
  onFilterChange, 
  onApplyFilters,
  onResetFilters,
  loading 
}: {
  companies: Company[];
  filters: ReportFilter;
  onFilterChange: (name: string, value: any) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  loading: boolean;
}) => {
  const theme = useTheme();
  
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        mb: 3
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <FilterIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Filtros de Relatório
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <TextField
            fullWidth
            label="Data Início"
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarIcon fontSize="small" color="action" />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <TextField
            fullWidth
            label="Data Fim"
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarIcon fontSize="small" color="action" />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Empresa</InputLabel>
            <Select
              value={filters.companyId || ''}
              label="Empresa"
              onChange={(e) => onFilterChange('companyId', e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <BusinessIcon fontSize="small" color="action" />
                </InputAdornment>
              }
            >
              <MenuItem value="">Todas</MenuItem>
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.corporateName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Operadora</InputLabel>
            <Select
              value={filters.provider || ''}
              label="Operadora"
              onChange={(e) => onFilterChange('provider', e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <PhoneIcon fontSize="small" color="action" />
                </InputAdornment>
              }
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="vivo">Vivo</MenuItem>
              <MenuItem value="claro">Claro</MenuItem>
              <MenuItem value="tim">TIM</MenuItem>
              <MenuItem value="oi">Oi</MenuItem>
              <MenuItem value="other">Outras</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ''}
              label="Status"
              onChange={(e) => onFilterChange('status', e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="pending">Pendente</MenuItem>
              <MenuItem value="paid">Pago</MenuItem>
              <MenuItem value="overdue">Vencido</MenuItem>
              <MenuItem value="canceled">Cancelado</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Tipo de Relatório</InputLabel>
            <Select
              value={filters.type || 'expense'}
              label="Tipo de Relatório"
              onChange={(e) => onFilterChange('type', e.target.value as any)}
            >
              <MenuItem value="expense">Despesas Gerais</MenuItem>
              <MenuItem value="provider">Por Operadora</MenuItem>
              <MenuItem value="company">Por Empresa</MenuItem>
              <MenuItem value="monthly">Mensal</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6} lg={6}>
          <Box sx={{ display: 'flex', gap: 2, height: '100%', alignItems: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onResetFilters}
              disabled={loading}
              sx={{ flex: 1 }}
            >
              Limpar Filtros
            </Button>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={onApplyFilters}
              disabled={loading}
              sx={{ 
                flex: 1,
                borderRadius: '8px',
                fontWeight: 600,
                boxShadow: '0 4px 10px rgba(0, 122, 255, 0.3)',
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Aplicar Filtros"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

// Página de Relatórios
const ReportsPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  // Estado para filtros
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: 'expense'
  });
  
  // Estado para dados do relatório
  const [reportData, setReportData] = useState<DetailedReport | null>(null);
  
  // Estados para dados específicos de gráficos
  const [monthlyData, setMonthlyData] = useState<MonthlySummary[]>([]);
  const [providerData, setProviderData] = useState<ProviderSummary[]>([]);
  
  // Cores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B'];
  const providerColors: { [key: string]: string } = {
    vivo: '#0066CC',
    claro: '#FF0000',
    tim: '#0000FF',
    oi: '#FFA500',
    other: '#999999'
  };
  
  // Carregar empresas
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await CompanyService.getAll();
        setCompanies(data);
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
      }
    };
    
    fetchCompanies();
  }, []);
  
  // Obter relatório detalhado
  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ReportService.getReport(filters);
      setReportData(data);
      
      // Carregar dados específicos para gráficos
      const yearNow = new Date().getFullYear();
      const monthlyData = await ReportService.getMonthlySummary(
        yearNow,
        filters.companyId
      );
      setMonthlyData(monthlyData);
      
      const providerData = await ReportService.getProviderBreakdown(
        filters.startDate,
        filters.endDate,
        filters.companyId
      );
      setProviderData(providerData);
    } catch (error: any) {
      console.error('Erro ao carregar relatório:', error);
      setError(error.message || 'Erro ao carregar dados do relatório');
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar relatório quando a página carregar
  useEffect(() => {
    fetchReport();
  }, []);
  
  // Manipular alterações nos filtros
  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manipular mudança de tab
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Exportar relatório
  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setExportLoading(true);
    
    try {
      const exportFilters = {
        ...filters,
        format
      };
      
      const blob = await ReportService.exportReport(exportFilters);
      
      // Criar URL para download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      
      // Limpar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
    } finally {
      setExportLoading(false);
    }
  };
  
  // Renderizar gráfico mensal
  const renderMonthlyChart = () => {
    if (!monthlyData || monthlyData.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Typography variant="body1" color="text.secondary">
            Sem dados para exibir
          </Typography>
        </Box>
      );
    }
    
    // Transformar dados para o formato esperado pelo gráfico
    const chartData = monthlyData.map(item => ({
      name: item.month,
      total: item.totalAmount,
      pago: item.paidAmount,
      pendente: item.pendingAmount,
      vencido: item.overdueAmount,
      faturas: item.invoiceCount
    }));
    
    return (
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <RechartsTooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => `Mês: ${label}`}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="total" 
            stackId="1"
            stroke={theme.palette.primary.main} 
            fill={theme.palette.primary.light} 
            name="Total"
          />
          <Area 
            type="monotone" 
            dataKey="pago" 
            stackId="2"
            stroke={theme.palette.success.main} 
            fill={theme.palette.success.light} 
            name="Pago"
          />
          <Area 
            type="monotone" 
            dataKey="pendente" 
            stackId="2"
            stroke={theme.palette.info.main} 
            fill={theme.palette.info.light} 
            name="Pendente"
          />
          <Area 
            type="monotone" 
            dataKey="vencido" 
            stackId="2"
            stroke={theme.palette.error.main} 
            fill={theme.palette.error.light} 
            name="Vencido"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };
  
  // Renderizar gráfico de operadoras
  const renderProviderChart = () => {
    if (!providerData || providerData.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Typography variant="body1" color="text.secondary">
            Sem dados para exibir
          </Typography>
        </Box>
      );
    }
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={providerData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="totalAmount"
                nameKey="provider"
                label={({ provider, percentage }) => `${provider}: ${formatPercentage(percentage)}`}
              >
                {providerData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={providerColors[entry.provider] || COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Grid>
        <Grid item xs={12} md={5}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {providerData.map((provider, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: providerColors[provider.provider] || theme.palette.text.primary }}>
                    {provider.provider.toUpperCase()}
                  </Typography>
                  <Chip
                    label={formatPercentage(provider.percentage)}
                    size="small"
                    sx={{
                      backgroundColor: providerColors[provider.provider] || COLORS[index % COLORS.length],
                      color: '#fff',
                      fontWeight: 600
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {provider.count} faturas
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(provider.totalAmount)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    );
  };
  
  // Renderizar gráfico comparativo
  const renderComparisonChart = () => {
    if (!reportData || !reportData.companyBreakdown || reportData.companyBreakdown.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Typography variant="body1" color="text.secondary">
            Sem dados para exibir
          </Typography>
        </Box>
      );
    }
    
    const chartData = reportData.companyBreakdown.map(item => ({
      name: item.companyName,
      total: item.totalAmount,
      media: item.avgAmount,
      faturas: item.totalInvoices
    }));
    
    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Bar 
            dataKey="total" 
            name="Total Gasto" 
            fill={theme.palette.primary.main} 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="media" 
            name="Média por Fatura" 
            fill={theme.palette.secondary.main}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  return (
    <AppleLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Relatórios e Análises
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchReport}
            disabled={loading}
          >
            Atualizar
          </Button>
          
          <Button
            variant="contained"
            startIcon={<FileIcon />}
            onClick={() => handleExport('pdf')}
            disabled={exportLoading || loading || !reportData}
            sx={{
              borderRadius: '10px',
              fontWeight: 600,
              boxShadow: '0 4px 10px rgba(0, 122, 255, 0.3)',
            }}
          >
            Exportar PDF
          </Button>
        </Box>
      </Box>
      
      {/* Filtros de relatório */}
      <FilterPanel
        companies={companies}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={fetchReport}
        onResetFilters={() => {
          setFilters({
            startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            type: 'expense'
          });
        }}
        loading={loading}
      />
      
      {/* Mensagem de erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Cards de resumo */}
      {reportData && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total de Faturas"
              value={reportData.summary.totalInvoices}
              subtitle="No período"
              icon={<BarChartIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Valor Total"
              value={formatCurrency(reportData.summary.totalAmount)}
              subtitle="No período"
              icon={<PieChartIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Valor Médio"
              value={formatCurrency(reportData.summary.avgAmount)}
              subtitle="Por fatura"
              icon={<TimelineIcon />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Valor Pendente"
              value={formatCurrency(reportData.summary.pendingAmount)}
              subtitle="A pagar"
              icon={<TimelineIcon />}
              color="warning"
            />
          </Grid>
        </Grid>
      )}
      
      {/* Tabs para diferentes visualizações */}
      <Paper sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main,
              height: 3,
            },
          }}
        >
          <Tab
            icon={<TimelineIcon />}
            iconPosition="start"
            label="Tendência Mensal"
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              minHeight: '64px',
            }}
          />
          <Tab
            icon={<PieChartIcon />}
            iconPosition="start"
            label="Por Operadora"
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              minHeight: '64px',
            }}
          />
          <Tab
            icon={<BarChartIcon />}
            iconPosition="start"
            label="Comparativo"
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              minHeight: '64px',
            }}
          />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TabPanel value={tabValue} index={0}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Tendência de Gastos Mensais
                </Typography>
                {renderMonthlyChart()}
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Distribuição por Operadora
                </Typography>
                {renderProviderChart()}
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Comparativo entre Contratos
                </Typography>
                {renderComparisonChart()}
              </TabPanel>
            </>
          )}
        </Box>
      </Paper>
      
      {/* Botões de exportação */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {/* Verde para Excel - representa sucesso, transferência */}
        <Button
          variant="outlined"
          onClick={() => handleExport('excel')}
          disabled={exportLoading || loading || !reportData}
          sx={{
            borderColor: 'rgba(46, 125, 50, 0.5)',
            color: '#2E7D32',
            '&:hover': {
              backgroundColor: 'rgba(46, 125, 50, 0.04)',
              borderColor: '#2E7D32'
            }
          }}
        >
          <DownloadIcon sx={{ mr: 1, color: '#2E7D32' }} fontSize="small" />
          Excel
        </Button>
        
        {/* Azul para CSV - representa dados, informação */}
        <Button
          variant="outlined"
          onClick={() => handleExport('csv')}
          disabled={exportLoading || loading || !reportData}
          sx={{
            borderColor: 'rgba(25, 118, 210, 0.5)',
            color: '#1976D2',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
              borderColor: '#1976D2'
            }
          }}
        >
          <DownloadIcon sx={{ mr: 1, color: '#1976D2' }} fontSize="small" />
          CSV
        </Button>
        
        {/* Laranja para Imprimir - representa ação, atenção */}
        <Button
          variant="outlined"
          onClick={() => window.print()}
          disabled={loading || !reportData}
          sx={{
            borderColor: 'rgba(237, 108, 2, 0.5)',
            color: '#ED6C02',
            '&:hover': {
              backgroundColor: 'rgba(237, 108, 2, 0.04)',
              borderColor: '#ED6C02'
            }
          }}
        >
          <PrintIcon sx={{ mr: 1, color: '#ED6C02' }} fontSize="small" />
          Imprimir
        </Button>
      </Box>
    </AppleLayout>
  );
};

export default ReportsPage;

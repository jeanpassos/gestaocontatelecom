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
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ChatBubbleOutline as ChatIcon,
  NotificationsNone as NotificationIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  CreditCard as CreditCardIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CompanyService, { Company } from '../../services/company.service';
import InvoiceService, { Invoice } from '../../services/invoice.service';

// Componente de estatística com estilo Apple/WhatsApp
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
        }
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
              backgroundColor: `${color}.light`,
              color: `${color}.main`,
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
                  backgroundColor: isPositive ? 'success.light' : 'error.light',
                  color: isPositive ? 'success.dark' : 'error.dark',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                {isPositive ? <ArrowUpIcon fontSize="small" sx={{ mr: 0.5 }} /> : <ArrowDownIcon fontSize="small" sx={{ mr: 0.5 }} />}
                {Math.abs(change)}%
              </Box>
            )}
          </Box>
        </Box>
        
        <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
          {value}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
      </Box>
    </Card>
  );
};

// Componente de item de fatura com estilo Apple/WhatsApp
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
        }
      }}
    >
      <Avatar 
        sx={{ 
          width: 42, 
          height: 42,
          bgcolor: invoice.provider === 'Vivo' ? '#0066CC' :
                  invoice.provider === 'Claro' ? '#FF0000' :
                  invoice.provider === 'Tim' ? '#0000FF' :
                  invoice.provider === 'Oi' ? '#FFA500' : '#999999',
        }}
      >
        {invoice.provider?.charAt(0) || 'T'}
      </Avatar>
      
      <Box sx={{ ml: 2, flex: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {invoice.invoiceNumber || `Fatura ${invoice.id}`}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {invoice.company?.corporateName || 'Empresa não especificada'}
        </Typography>
      </Box>
      
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {formatCurrency(invoice.amount)}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: isPaid ? 'success.main' : isOverdue ? 'error.main' : 'warning.main',
            fontWeight: 500
          }}
        >
          {isPaid ? 'Pago' : isOverdue ? 'Atrasado' : 'Pendente'}
        </Typography>
      </Box>
    </Box>
  );
};

// Componente de item de empresa com estilo Apple/WhatsApp
const CompanyItem = ({ company }: any) => {
  return (
    <Box 
      sx={{ 
        p: 2, 
        mb: 1, 
        borderRadius: '12px',
        backgroundColor: 'background.paper',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        }
      }}
    >
      <Avatar 
        sx={{ 
          width: 42, 
          height: 42,
          bgcolor: 'primary.main',
        }}
      >
        {company.corporateName?.charAt(0) || 'C'}
      </Avatar>
      
      <Box sx={{ ml: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {company.corporateName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          CNPJ: {company.cnpj}
        </Typography>
      </Box>
    </Box>
  );
};

const ModernDashboard: React.FC = () => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Tentativa de buscar dados do PostgreSQL
        const [companiesData, invoicesData] = await Promise.all([
          CompanyService.getAll(),
          InvoiceService.getAll()
        ]);
        
        setCompanies(companiesData || []);
        setInvoices(invoicesData || []);
        
        // Calcular estatísticas
        if (invoicesData) {
          const pending = invoicesData.filter(inv => !inv.paymentDate);
          const pendingAmount = pending.reduce((sum, inv) => sum + inv.amount, 0);
          
          setStats({
            totalCompanies: companiesData?.length || 0,
            totalInvoices: invoicesData.length,
            pendingInvoices: pending.length,
            totalPendingAmount: pendingAmount
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar dados do servidor:', err);
        setError('Falha ao carregar dados do servidor. Verifique sua conexão.');
        
        // Dados simulados para demonstração
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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menu no estilo WhatsApp
  const menuItems = [
    { icon: <DashboardIcon />, label: 'Dashboard', path: '/dashboard', notifications: 0 },
    { icon: <BusinessIcon />, label: 'Contratos', path: '/companies', notifications: 2 },
    { icon: <ReceiptIcon />, label: 'Faturas', path: '/invoices', notifications: 5 },
    { icon: <PeopleIcon />, label: 'Usuários', path: '/users', notifications: 0 },
    { icon: <SettingsIcon />, label: 'Configurações', path: '/settings', notifications: 0 },
  ];

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: theme.palette.mode === 'dark' ? '#111b21' : '#f0f2f5',
    }}>
      {/* Cabeçalho do menu */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center',
        backgroundColor: theme.palette.mode === 'dark' ? '#202c33' : '#008069',
        color: '#fff'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          TelecomBill
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex' }}>
          <IconButton color="inherit" size="small">
            <SearchIcon />
          </IconButton>
          <IconButton color="inherit" size="small">
            <MoreIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Lista de navegação */}
      <List sx={{ flex: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.label}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              borderRadius: '8px',
              mb: 0.5,
              backgroundColor: location.pathname === item.path ? 
                (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)') : 
                'transparent',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 
                  'rgba(255, 255, 255, 0.08)' : 
                  'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: location.pathname === item.path ? 
                theme.palette.primary.main : 
                theme.palette.text.secondary,
              minWidth: 40
            }}>
              {item.notifications > 0 ? (
                <Badge 
                  badgeContent={item.notifications} 
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.6rem',
                      height: 16,
                      minWidth: 16,
                      padding: '0 4px'
                    }
                  }}
                >
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText 
              primary={item.label} 
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 600 : 400,
                color: location.pathname === item.path ? 
                  theme.palette.text.primary : 
                  theme.palette.text.secondary
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Perfil do usuário */}
      <Box sx={{ 
        p: 1.5, 
        display: 'flex', 
        alignItems: 'center',
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Avatar 
          sx={{ width: 40, height: 40 }}
          src="https://randomuser.me/api/portraits/men/32.jpg"
        >
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <Box sx={{ ml: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user?.email?.split('@')[0] || 'Usuário'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email || 'usuario@exemplo.com'}
          </Typography>
        </Box>
        <IconButton 
          sx={{ ml: 'auto' }} 
          onClick={handleLogout}
          color="error"
        >
          <LogoutIcon />
        </IconButton>
      </Box>
    </Box>
  );

  // Conteúdo principal
  const mainContent = (
    <Box sx={{ 
      p: { xs: 2, md: 3 },
      backgroundColor: theme.palette.mode === 'dark' ? '#0c1317' : '#f0f2f5',
      minHeight: '100vh'
    }}>
      {/* Cabeçalho */}
      <Box sx={{ 
        mb: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Olá, {user?.email?.split('@')[0] || 'Usuário'}! Bem-vindo ao seu painel de controle.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Notificações">
            <IconButton 
              sx={{ 
                backgroundColor: theme.palette.background.paper,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                '&:hover': { backgroundColor: theme.palette.background.default }
              }}
            >
              <Badge badgeContent={3} color="primary">
                <NotificationIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Mensagens">
            <IconButton 
              sx={{ 
                backgroundColor: theme.palette.background.paper,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                '&:hover': { backgroundColor: theme.palette.background.default }
              }}
            >
              <Badge badgeContent={2} color="primary">
                <ChatIcon />
              </Badge>
            </IconButton>
          </Tooltip>
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
          <CircularProgress />
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
              <Typography variant="body2">{error}</Typography>
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
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<CreditCardIcon />}
                title="Valor Pendente"
                value={formatCurrency(stats.totalPendingAmount)}
                change={8}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<BusinessIcon />}
                title="Contratos"
                value={stats.totalCompanies}
                change={0}
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<WarningIcon />}
                title="Faturas Pendentes"
                value={stats.pendingInvoices}
                change={-5}
                color="warning"
              />
            </Grid>
          </Grid>
          
          {/* Conteúdo principal */}
          <Grid container spacing={3}>
            {/* Faturas Recentes */}
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
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Faturas Recentes
                  </Typography>
                  <IconButton size="small">
                    <MoreIcon />
                  </IconButton>
                </Box>
                
                {invoices.length === 0 ? (
                  <Box sx={{ 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: theme.palette.text.secondary,
                    backgroundColor: theme.palette.background.default,
                    borderRadius: '12px'
                  }}>
                    <ReceiptIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      Nenhuma fatura encontrada no banco de dados
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      As faturas aparecerão aqui quando forem adicionadas
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {/* Aqui seriam exibidas as faturas reais do banco de dados */}
                    {/* Usando dados simulados para demonstração */}
                    <InvoiceItem 
                      invoice={{ 
                        id: '1', 
                        invoiceNumber: 'FAT-001', 
                        amount: 1290.50, 
                        provider: 'Vivo',
                        status: 'paid',
                        company: { corporateName: 'Empresa ABC' }
                      }} 
                      formatCurrency={formatCurrency} 
                    />
                    <InvoiceItem 
                      invoice={{ 
                        id: '2', 
                        invoiceNumber: 'FAT-002', 
                        amount: 852.30, 
                        provider: 'Claro',
                        status: 'pending',
                        company: { corporateName: 'Empresa XYZ' }
                      }} 
                      formatCurrency={formatCurrency} 
                    />
                    <InvoiceItem 
                      invoice={{ 
                        id: '3', 
                        invoiceNumber: 'FAT-003', 
                        amount: 435.90, 
                        provider: 'Tim',
                        status: 'overdue',
                        company: { corporateName: 'Empresa 123' }
                      }} 
                      formatCurrency={formatCurrency} 
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
            
            {/* Contratos */}
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
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Contratos
                  </Typography>
                  <IconButton size="small">
                    <MoreIcon />
                  </IconButton>
                </Box>
                
                {companies.length === 0 ? (
                  <Box sx={{ 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: theme.palette.text.secondary,
                    backgroundColor: theme.palette.background.default,
                    borderRadius: '12px'
                  }}>
                    <BusinessIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      Nenhuma empresa cadastrada no banco de dados
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      As empresas aparecerão aqui quando forem adicionadas
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {/* Aqui seriam exibidas as empresas reais do banco de dados */}
                    {/* Usando dados simulados para demonstração */}
                    <CompanyItem 
                      company={{ 
                        id: '1', 
                        corporateName: 'Empresa ABC', 
                        cnpj: '12.345.678/0001-90'
                      }} 
                    />
                    <CompanyItem 
                      company={{ 
                        id: '2', 
                        corporateName: 'Empresa XYZ', 
                        cnpj: '98.765.432/0001-10'
                      }} 
                    />
                    <CompanyItem 
                      company={{ 
                        id: '3', 
                        corporateName: 'Empresa 123', 
                        cnpj: '45.678.901/0001-23'
                      }} 
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Menu lateral */}
      <Box
        component="nav"
        sx={{ 
          width: { sm: 320 }, 
          flexShrink: { sm: 0 },
          '& .MuiDrawer-paper': { 
            width: 320,
            boxSizing: 'border-box',
            borderRight: 'none'
          }
        }}
      >
        {/* Menu para dispositivos móveis */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Menu para desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          width: { sm: `calc(100% - 320px)` } 
        }}
      >
        {mainContent}
      </Box>
    </Box>
  );
};

export default ModernDashboard;

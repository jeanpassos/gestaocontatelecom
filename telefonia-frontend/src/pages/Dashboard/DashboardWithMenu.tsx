import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CompanyService, { Company } from '../../services/company.service';
import InvoiceService, { Invoice } from '../../services/invoice.service';

const drawerWidth = 240;

const DashboardWithMenu: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
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
        
        // Definir dados vazios em caso de erro
        setCompanies([]);
        setInvoices([]);
        setStats({
          totalCompanies: 0,
          totalInvoices: 0,
          pendingInvoices: 0,
          totalPendingAmount: 0
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

  const navigationItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { text: 'Empresas', path: '/companies', icon: <BusinessIcon /> },
    { text: 'Faturas', path: '/invoices', icon: <ReceiptIcon /> },
    { text: 'Usuários', path: '/users', icon: <PeopleIcon /> },
    { text: 'Configurações', path: '/settings', icon: <SettingsIcon /> },
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: theme.palette.primary.main,
        color: 'white'
      }}>
        <Typography variant="h6" noWrap component="div">
          TelecomBill
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Olá, {user?.email?.split('@')[0] || 'Usuário'}!
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Card de Faturas Recentes */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <CardHeader title="Faturas Recentes" />
              <Divider />
              <CardContent>
                {invoices.length === 0 ? (
                  <Typography>Nenhuma fatura encontrada no banco de dados.</Typography>
                ) : (
                  <Box>
                    {invoices.slice(0, 5).map(invoice => (
                      <Box key={invoice.id} sx={{ mb: 1, pb: 1, borderBottom: '1px solid #eee' }}>
                        <Typography variant="subtitle2">{invoice.invoiceNumber}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {invoice.company?.corporateName || 'Empresa não especificada'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(invoice.amount)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Card de Empresas */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <CardHeader title="Empresas" />
              <Divider />
              <CardContent>
                {companies.length === 0 ? (
                  <Typography>Nenhuma empresa cadastrada no banco de dados.</Typography>
                ) : (
                  <Box>
                    {companies.slice(0, 5).map(company => (
                      <Box key={company.id} sx={{ mb: 1, pb: 1, borderBottom: '1px solid #eee' }}>
                        <Typography variant="subtitle2">{company.corporateName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          CNPJ: {company.cnpj}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Card de Status Geral */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <CardHeader title="Status Geral" />
              <Divider />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Total de Empresas:</Typography>
                  <Typography fontWeight="bold">{stats.totalCompanies}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Total de Faturas:</Typography>
                  <Typography fontWeight="bold">{stats.totalInvoices}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Faturas Pendentes:</Typography>
                  <Typography fontWeight="bold" color="warning.main">{stats.pendingInvoices}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Valor Total Pendente:</Typography>
                  <Typography fontWeight="bold" color="error.main">{formatCurrency(stats.totalPendingAmount)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardWithMenu;

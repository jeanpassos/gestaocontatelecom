import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  useTheme,
  Container,
  Button,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  People as PeopleIcon,
  Settings as SettingsIcon,
  VpnKey as VpnKeyIcon,
  Home as HomeIcon,
  AdminPanelSettings as AdminIcon,
  Api as ApiIcon,
  Business as BusinessIcon, // Ícone para Operadoras
  Security as SecurityIcon // Ícone para Permissões
} from '@mui/icons-material';
import AppleLayout from '../../components/Layout/AppleLayout';
import { useAuth } from '../../context/AuthContext';
import UsersTab from './UsersTab';
import RolesTab from './RolesTab';
import SettingsTab from './SettingsTab';
import IntegrationsTab from './IntegrationsTab';
import ProvidersTab from './ProvidersTab';
import PermissionsMatrix from '../../components/Admin/PermissionsMatrix';

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
      style={{ padding: '24px 0' }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

// Função auxiliar para propriedades de acessibilidade
const a11yProps = (index: number) => {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
};

// Página principal de Administração
const AdminPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  
  // Ler o parâmetro de consulta 'tab' para selecionar a aba correta
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam !== null) {
      const tabIndex = parseInt(tabParam, 10);
      // Atualizar o limite para o número de abas (0 a 4)
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 4) { 
        setActiveTab(tabIndex);
      }
    }
  }, [location.search]);

  // Verificar se o usuário é admin
  if (user?.role !== 'admin') {
    return (
      <AppleLayout>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100vh - 200px)',
            textAlign: 'center',
            p: 4
          }}
        >
          <AdminIcon
            sx={{
              fontSize: 80,
              color: theme.palette.error.main,
              mb: 2,
              opacity: 0.7
            }}
          />
          <Typography variant="h5" gutterBottom>
            Acesso Restrito
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Esta área é reservada para administradores do sistema.
          </Typography>
          <Button
            variant="contained"
            href="/"
            startIcon={<HomeIcon />}
          >
            Voltar para o Dashboard
          </Button>
        </Box>
      </AppleLayout>
    );
  }

  // Manipular mudança de tab
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <AppleLayout>
      <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 0 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" href="/" sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <AdminIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Administração
          </Typography>
        </Breadcrumbs>

        {/* Título da página */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Administração do Sistema
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie usuários, perfis e configurações do sistema
          </Typography>
        </Box>

        {/* Container das tabs */}
        <Paper
          sx={{
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            mb: 3
          }}
        >
          {/* Tabs de navegação */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="admin tabs"
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
              '& .MuiTabs-indicator': {
                backgroundColor: theme.palette.primary.main,
                height: 3,
              },
              px: 2
            }}
          >
            <Tab
              icon={<PeopleIcon />}
              iconPosition="start"
              label="Usuários"
              {...a11yProps(0)}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                minHeight: '64px',
                fontSize: '1rem'
              }}
            />
            <Tab
              icon={<VpnKeyIcon />}
              iconPosition="start"
              label="Perfis de Acesso"
              {...a11yProps(1)}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                minHeight: '64px',
                fontSize: '1rem'
              }}
            />
            <Tab
              icon={<SecurityIcon />}
              iconPosition="start"
              label="Permissões"
              {...a11yProps(2)}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                minHeight: '64px',
                fontSize: '1rem'
              }}
            />
            <Tab
              icon={<SettingsIcon />}
              iconPosition="start"
              label="Configurações"
              {...a11yProps(3)}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                minHeight: '64px',
                fontSize: '1rem'
              }}
            />
            <Tab
              icon={<ApiIcon />}
              iconPosition="start"
              label="Integrações"
              {...a11yProps(4)}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                minHeight: '64px',
                fontSize: '1rem'
              }}
            />
            <Tab
              icon={<BusinessIcon />}
              iconPosition="start"
              label="Operadoras"
              {...a11yProps(5)}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                minHeight: '64px',
                fontSize: '1rem'
              }}
            />
          </Tabs>

          {/* Conteúdo das tabs */}
          <Box sx={{ p: 3 }}>
            <TabPanel value={activeTab} index={0}>
              <UsersTab />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <RolesTab />
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              <PermissionsMatrix />
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
              <SettingsTab />
            </TabPanel>
            <TabPanel value={activeTab} index={4}>
              <IntegrationsTab />
            </TabPanel>
            <TabPanel value={activeTab} index={5}>
              <ProvidersTab />
            </TabPanel>
          </Box>
        </Paper>
      </Box>
    </AppleLayout>
  );
};

export default AdminPage;

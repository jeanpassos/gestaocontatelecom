import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConnectionProvider } from './context/ConnectionContext';
import theme from './assets/theme';
import { UserRole } from './config/permissions';
import { usePermissions } from './hooks/usePermissions';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/AppleDashboard';
import Invoices from './pages/Invoices/InvoicesPage';
import Companies from './pages/Companies/CompaniesPage';
import Reports from './pages/Reports/ReportsPage';
import Admin from './pages/Admin/AdminPage';
import ConsultantPage from './pages/Consultant/ConsultantPage';
import ConsultantUnderDevelopment from './pages/Consultant/ConsultantUnderDevelopment';
import ConsultantDashboard from './pages/Consultant/ConsultantDashboardNew';
import PermissionsMatrix from './components/Admin/PermissionsMatrix';

import { CircularProgress, Box, Alert, Button } from '@mui/material';

// Rota protegida que verifica autenticação e permissões usando matriz flexível
const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  page = ''
}: { 
  children: React.ReactNode, 
  requiredRoles?: string[],
  requiredPermissions?: string[],
  page?: string
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const { checkPermission } = usePermissions();
  // Estado para forçar rerender quando permissões mudarem
  const [permissionsVersion, setPermissionsVersion] = useState(0);
  
  // Escutar evento de atualização de permissões
  useEffect(() => {
    const handlePermissionsUpdated = () => {
      console.log('ProtectedRoute: Permissões atualizadas, reavaliando acesso...');
      // Forçar rerender do componente
      setPermissionsVersion(prev => prev + 1);
    };
    
    // Adicionar listener para o evento de atualização de permissões
    window.addEventListener('permissionsUpdated', handlePermissionsUpdated);
    
    // Limpar o listener quando o componente for desmontado
    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissionsUpdated);
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // Se não há requisitos, permitir acesso
  if (requiredRoles.length === 0 && requiredPermissions.length === 0 && !page) {
    return <>{children}</>;
  }
  
  const userRole = user?.role as UserRole;
  
  // Verificar acesso por página usando hook de permissões dinâmicas
  const pagePermissions = {
    '/dashboard': 'dashboard.view',
    '/companies': 'companies.view',
    '/invoices': 'invoices.view',
    '/reports': 'reports.view',
    '/admin': 'admin.view',
    '/consultant-dashboard': 'consultant.dashboard',
    '/client-dashboard': 'companies.view' // Cliente tem dashboard alternativo usando a permissão de ver contratos
  };
  
  // Lista de páginas alternativas para fallback em ordem de prioridade por perfil
  const fallbackPages = {
    admin: ['/dashboard', '/companies', '/invoices', '/reports', '/admin'],
    supervisor: ['/dashboard', '/companies', '/invoices', '/reports'],
    consultant: ['/consultant-dashboard', '/companies', '/invoices'],
    client: ['/companies', '/invoices', '/reports']
  };
  
  const requiredPermission = pagePermissions[page as keyof typeof pagePermissions];
  
  // Verificar permissão para a página atual
  let hasRequiredPermission = true; // Padrão: permitido se não houver requisito
  
  if (requiredPermission) {
    hasRequiredPermission = checkPermission(requiredPermission);
  }
  
  // Se não tem permissão para a página solicitada
  if (page && requiredPermission && !hasRequiredPermission) {
    // Descobrir a primeira página alternativa que o usuário tem permissão
    const userFallbacks = fallbackPages[userRole as keyof typeof fallbackPages] || fallbackPages.client;
    
    // Encontrar a primeira página que o usuário tem permissão para acessar
    for (const fallbackPage of userFallbacks) {
      const fallbackPermission = pagePermissions[fallbackPage as keyof typeof pagePermissions];
      if (!fallbackPermission || checkPermission(fallbackPermission)) {
        console.log(`Redirecionando para página alternativa: ${fallbackPage}`);
        return <Navigate to={fallbackPage} replace />;
      }
    }
    
    // Se não encontrar nenhuma página alternativa, mostrar acesso negado
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Acesso Negado</strong><br />
          Você não tem permissão para acessar esta página.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.history.back()}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
      </Box>
    );
  }
  
  // Verificar por roles específicos (compatibilidade com código antigo)
  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    // Redirecionar consultor para seu dashboard
    if (userRole === 'consultant') {
      return <Navigate to="/consultant-dashboard" replace />;
    }
    
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Acesso Restrito</strong><br />
          Esta página é restrita ao seu nível de acesso.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.href = '/dashboard'}
        >
          Ir para Dashboard
        </Button>
      </Box>
    );
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
        <ConnectionProvider>
          <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute page="/dashboard">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/invoices"
                element={
                  <ProtectedRoute page="/invoices">
                    <Invoices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/companies"
                element={
                  <ProtectedRoute page="/companies">
                    <Companies />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute page="/reports">
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute page="/admin">
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/permissions"
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <PermissionsMatrix />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/consultant-dashboard"
                element={
                  <ProtectedRoute page="/consultant-dashboard">
                    <ConsultantDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/consultant-dev"
                element={
                  <ProtectedRoute requiredRoles={['consultant']}>
                    <ConsultantUnderDevelopment />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
          </AuthProvider>
        </ConnectionProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;

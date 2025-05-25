import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConnectionProvider } from './context/ConnectionContext';
import theme from './assets/theme';

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

// Rota protegida que verifica autenticação e papel do usuário
const ProtectedRoute = ({ children, requiredRoles = [] }: { children: React.ReactNode, requiredRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // Se não há papéis requeridos, permitir acesso
  if (requiredRoles.length === 0) {
    return <>{children}</>;
  }
  
  // Verificar se o usuário tem o papel necessário
  if (user && requiredRoles.includes(user.role)) {
    return <>{children}</>;
  }
  
  // Se o usuário for consultor, redirecionar para a página do consultor
  if (user && user.role === 'consultant') {
    return <Navigate to="/consultant-dashboard" replace />;
  }
  
  // Para outros papéis não autorizados, redirecionar para o dashboard
  return <Navigate to="/dashboard" replace />;
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
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/invoices"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'manager', 'consultant']}>
                    <Invoices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/companies"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'manager', 'consultant']}>
                    <Companies />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'manager']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/consultant-dashboard"
                element={
                  <ProtectedRoute>
                    <ConsultantDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/consultant-dev"
                element={
                  <ProtectedRoute>
                    <ConsultantUnderDevelopment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
              />
            </Routes>
          </BrowserRouter>
          </AuthProvider>
        </ConnectionProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;

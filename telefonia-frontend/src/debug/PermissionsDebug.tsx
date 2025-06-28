import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { canAccessPage, hasPermission, getRolePermissions, UserRole } from '../config/permissions';

const PermissionsDebug: React.FC = () => {
  const { user } = useAuth();

  const testPages = ['/dashboard', '/companies', '/invoices', '/reports', '/admin', '/consultant-dashboard'];
  const userRole = user?.role as UserRole;
  
  console.log('🔍 DEBUG - User from context:', user);
  console.log('🔍 DEBUG - UserRole extracted:', userRole);
  console.log('🔍 DEBUG - Role permissions:', getRolePermissions(userRole));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Debug de Permissões
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Informações do Usuário
        </Typography>
        <Typography><strong>Nome:</strong> {user?.name || 'N/A'}</Typography>
        <Typography><strong>Email:</strong> {user?.email || 'N/A'}</Typography>
        <Typography><strong>Role:</strong> {user?.role || 'N/A'}</Typography>
        <Typography><strong>Role (cast):</strong> {userRole || 'N/A'}</Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Permissões do Role "{userRole}"
        </Typography>
        {userRole ? (
          <Box>
            {Object.entries(getRolePermissions(userRole)).map(([permission, allowed]) => (
              <Typography key={permission}>
                <strong>{permission}:</strong> {allowed ? '✅ Permitido' : '❌ Negado'}
              </Typography>
            ))}
          </Box>
        ) : (
          <Alert severity="error">Role não encontrado!</Alert>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Teste de Acesso às Páginas
        </Typography>
        {testPages.map(page => {
          const canAccess = canAccessPage(userRole, page);
          return (
            <Box key={page} sx={{ mb: 1 }}>
              <Typography>
                <strong>{page}:</strong> {canAccess ? '✅ Permitido' : '❌ Negado'}
              </Typography>
            </Box>
          );
        })}
      </Paper>
    </Box>
  );
};

export default PermissionsDebug;

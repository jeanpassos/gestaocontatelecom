import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Divider,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  AVAILABLE_PERMISSIONS,
  DEFAULT_PERMISSION_MATRIX,
  PermissionMatrix,
  Permission,
  UserRole,
} from '../../config/permissions';
import { permissionsService } from '../../services/permissions.service';

const PermissionsMatrix: React.FC = () => {
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>(DEFAULT_PERMISSION_MATRIX);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  // Carregar matriz de permissões do backend na inicialização
  useEffect(() => {
    setLoading(true);
    permissionsService.getMatrix()
      .then(matrix => {
        setPermissionMatrix(matrix);
        console.log('Matriz de permissões carregada do backend:', matrix);
      })
      .catch(error => {
        console.error('Erro ao carregar matriz de permissões do backend:', error);
        setAlertMessage('Erro ao carregar matriz de permissões. Usando valores padrão.');
        setAlertType('error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const roles: UserRole[] = ['admin', 'supervisor', 'consultant', 'client'];

  const roleLabels: { [key in UserRole]: string } = {
    admin: 'Administrador',
    supervisor: 'Supervisor',
    consultant: 'Consultor',
    client: 'Cliente',
  };

  const roleColors: { [key in UserRole]: "primary" | "secondary" | "success" | "info" } = {
    admin: 'primary',
    supervisor: 'secondary',
    consultant: 'success',
    client: 'info',
  };

  // Agrupar permissões por categoria
  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as { [category: string]: Permission[] });

  const handlePermissionChange = (role: UserRole, permissionId: string, checked: boolean) => {
    setPermissionMatrix(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permissionId]: checked,
      }
    }));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Salvar no backend
      await permissionsService.updateMatrix(permissionMatrix);
      
      // A função updateMatrix já atualiza o localStorage e dispara o evento permissionsUpdated
      
      console.log('Matriz de permissões salva com sucesso no backend:', permissionMatrix);
      setHasChanges(false);
      setAlertMessage('Matriz de permissões salva com sucesso!');
      setAlertType('success');
    } catch (error) {
      console.error('Erro ao salvar matriz de permissões:', error);
      setAlertMessage('Erro ao salvar matriz de permissões.');
      setAlertType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    const confirmReset = window.confirm(
      'Tem certeza que deseja resetar todas as permissões para os valores padrão? Esta ação não pode ser desfeita.'
    );

    if (confirmReset) {
      setSaving(true);
      try {
        // Resetar no backend
        await permissionsService.resetToDefault();
        
        // Recarregar a matriz atualizada
        const updatedMatrix = await permissionsService.getMatrix();
        setPermissionMatrix(updatedMatrix);
        
        // Função resetToDefault já atualiza o localStorage e dispara evento
        
        setHasChanges(false);
        setAlertMessage('Permissões resetadas para os valores padrão com sucesso!');
        setAlertType('success');
      } catch (error) {
        console.error('Erro ao resetar para valores padrão:', error);
        setAlertMessage('Erro ao resetar permissões para valores padrão.');
        setAlertType('error');
      } finally {
        setSaving(false);
      }
    }
  };

  const getPermissionCount = (role: UserRole): number => {
    return Object.values(permissionMatrix[role] || {}).filter(Boolean).length;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box mt={2}>
        {alertMessage && (
          <Alert 
            severity={alertType} 
            onClose={() => setAlertMessage(null)}
            sx={{ mb: 2 }}
          >
            {alertMessage}
          </Alert>
        )}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleResetDefaults}
            disabled={!hasChanges}
          >
            Resetar Padrões
          </Button>
          
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveChanges}
            disabled={!hasChanges || saving}
            sx={{
              boxShadow: '0 4px 10px rgba(0, 122, 255, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 15px rgba(0, 122, 255, 0.4)',
              }
            }}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </Box>
      </Box>

      {hasChanges && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Você tem alterações não salvas na matriz de permissões.
        </Alert>
      )}

      {/* Resumo dos Perfis */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Resumo dos Perfis
        </Typography>
        <Grid container spacing={2}>
          {roles.map(role => (
            <Grid item xs={12} sm={6} md={3} key={role}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  label={roleLabels[role]}
                  color={roleColors[role]}
                  sx={{ mb: 1, fontWeight: 600 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {getPermissionCount(role)} permissões ativas
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Matriz de Permissões por Categoria */}
      {Object.entries(groupedPermissions).map(([category, permissions]) => (
        <Accordion key={category} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {category}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ width: '100%' }}>
              {permissions.map(permission => (
                <Box key={permission.id} sx={{ mb: 2 }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {permission.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {permission.description}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {roles.map(role => (
                      <Grid item xs={12} sm={6} md={3} key={role}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={Boolean(permissionMatrix[role]?.[permission.id])}
                              onChange={(e) => handlePermissionChange(role, permission.id, e.target.checked)}
                              color={roleColors[role]}
                            />
                          }
                          label={roleLabels[role]}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default PermissionsMatrix;

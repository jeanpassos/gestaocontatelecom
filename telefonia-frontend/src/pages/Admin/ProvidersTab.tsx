import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import ProviderService, { Provider, ProviderType } from '../../services/provider.service';
import { useSnackbar } from 'notistack';

// Função para traduzir ProviderType para português
const translateProviderType = (type: ProviderType): string => {
  switch (type) {
    case ProviderType.TELEPHONY:
      return 'Telefonia';
    case ProviderType.INTERNET:
      return 'Internet';
    case ProviderType.GENERAL:
      return 'Geral';
    default:
      return type;
  }
};

// Removida a duplicata da interface ProviderModalProps e import de useSnackbar
// A interface ProviderModalProps é definida abaixo uma única vez.

interface ProviderModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (provider: Partial<Provider>) => void;
  provider?: Provider;
  loading: boolean;
}

const ProviderModal: React.FC<ProviderModalProps> = ({ open, onClose, onSave, provider, loading }) => {
  const [formData, setFormData] = useState<Partial<Provider>>({
    name: '',
    value: '',
    type: ProviderType.GENERAL,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name,
        value: provider.value,
        type: provider.type,
      });
    } else {
      setFormData({ name: '', value: '', type: ProviderType.GENERAL });
    }
    setErrors({});
  }, [provider, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
    if (errors[name as string]) {
      setErrors(prev => ({ ...prev, [name as string]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.value?.trim()) newErrors.value = 'Valor é obrigatório';
    if (!formData.type) newErrors.type = 'Tipo é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{provider ? 'Editar Operadora' : 'Nova Operadora'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nome da Operadora"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Valor (identificador único, ex: vivo_fibra)"
              name="value"
              value={formData.value}
              onChange={handleChange}
              error={!!errors.value}
              helperText={errors.value}
              disabled={loading || !!provider} // Não permitir editar valor após criação
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.type}>
              <InputLabel id="provider-type-label">Tipo</InputLabel>
              <Select
                labelId="provider-type-label"
                name="type"
                value={formData.type}
                label="Tipo"
                onChange={handleChange as any} // Cast para any para compatibilidade com SelectChangeEvent
                disabled={loading}
              >
                <MenuItem value={ProviderType.TELEPHONY}>Telefonia</MenuItem>
                <MenuItem value={ProviderType.INTERNET}>Internet</MenuItem>
                <MenuItem value={ProviderType.GENERAL}>Geral</MenuItem>
              </Select>
              {errors.type && <Typography color="error" variant="caption">{errors.type}</Typography>}
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ProvidersTab: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | undefined>(undefined);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<Provider | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ProviderService.getAll();
      setProviders(data);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar operadoras.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleOpenModal = (provider?: Provider) => {
    setEditingProvider(provider);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProvider(undefined);
  };

  const handleSaveProvider = async (providerData: Partial<Provider>) => {
    setLoading(true);
    try {
      if (editingProvider) {
        await ProviderService.update(editingProvider.id, providerData);
        enqueueSnackbar('Operadora atualizada com sucesso!', { variant: 'success' });
      } else {
        await ProviderService.create(providerData as Omit<Provider, 'id'>);
        enqueueSnackbar('Operadora criada com sucesso!', { variant: 'success' });
      }
      fetchProviders();
      handleCloseModal();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro ao salvar operadora.';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProvider = async () => {
    if (!providerToDelete) return;
    setLoading(true);
    try {
      await ProviderService.delete(providerToDelete.id);
      enqueueSnackbar('Operadora excluída com sucesso!', { variant: 'success' });
      fetchProviders();
      setDeleteConfirmOpen(false);
      setProviderToDelete(null);
    } catch (error) {
      enqueueSnackbar('Erro ao excluir operadora.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (provider: Provider) => {
    setProviderToDelete(provider);
    setDeleteConfirmOpen(true);
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Gerenciamento de Operadoras</Typography>
        <Box>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchProviders} sx={{ mr: 1 }}>
            Atualizar
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
            Nova Operadora
          </Button>
        </Box>
      </Box>
      {loading && <CircularProgress sx={{ display: 'block', margin: 'auto' }} />}
      {!loading && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {providers.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>{provider.name}</TableCell>
                  <TableCell>{provider.value}</TableCell>
                  <TableCell>{translateProviderType(provider.type)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleOpenModal(provider)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton size="small" onClick={() => openDeleteConfirm(provider)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <ProviderModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProvider}
        provider={editingProvider}
        loading={loading}
      />
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a operadora "{providerToDelete?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteProvider} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ProvidersTab;

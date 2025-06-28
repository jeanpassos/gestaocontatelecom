import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Tooltip,
  Chip,
  useTheme,
  Alert,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  CloudDownload as CloudDownloadIcon
} from '@mui/icons-material';
import SegmentService, { Segment } from '../../services/segment.service';
import { useSnackbar } from 'notistack';

// Importando segmentos padrão diretamente
const defaultSegments = [
  { name: 'Comércio Varejista', value: 'comercio_varejista' },
  { name: 'Comércio Atacadista', value: 'comercio_atacadista' },
  { name: 'Indústria de Transformação', value: 'industria_transformacao' },
  { name: 'Indústria de Base', value: 'industria_base' },
  { name: 'Serviços Financeiros', value: 'servicos_financeiros' },
  { name: 'Serviços de Saúde', value: 'servicos_saude' },
  { name: 'Serviços de Educação', value: 'servicos_educacao' },
  { name: 'Serviços de Tecnologia', value: 'servicos_tecnologia' },
  { name: 'Construção Civil', value: 'construcao_civil' },
  { name: 'Agronegócio', value: 'agronegocio' },
  { name: 'Transporte e Logística', value: 'transporte_logistica' },
  { name: 'Alimentação e Bebidas', value: 'alimentacao_bebidas' },
  { name: 'Hotelaria e Turismo', value: 'hotelaria_turismo' },
  { name: 'Entretenimento e Mídia', value: 'entretenimento_midia' },
  { name: 'Telecomunicações', value: 'telecomunicacoes' },
  { name: 'Energia', value: 'energia' },
  { name: 'Serviços Públicos', value: 'servicos_publicos' },
  { name: 'Terceiro Setor', value: 'terceiro_setor' },
  { name: 'Consultoria Empresarial', value: 'consultoria_empresarial' },
  { name: 'Outros', value: 'outros' }
];

// Componente de gerenciamento de segmentos
const SegmentsSection: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [openListModal, setOpenListModal] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [showDefaultSegments, setShowDefaultSegments] = useState(false);
  
  // Inicializar a lista de segmentos padrão com IDs temporários
  const [defaultSegmentsList] = useState(() => {
    return defaultSegments.map((segment, index) => ({
      ...segment,
      id: `default-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  });
  const [formData, setFormData] = useState({
    name: '',
    value: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    value: ''
  });

  // Carregar segmentos
  const loadSegments = async () => {
    setLoading(true);
    try {
      const data = await SegmentService.getAll();
      setSegments(data);
    } catch (error) {
      console.error('Erro ao carregar segmentos:', error);
      enqueueSnackbar('Erro ao carregar segmentos', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Efeito para monitorar quando o modal é aberto
  useEffect(() => {
    if (openListModal) {
      loadSegments();
    }
  }, [openListModal]);

  // Carregar segmentos ao montar o componente
  useEffect(() => {
    loadSegments();
  }, []);

  // Abrir diálogo para adicionar novo segmento
  const handleAddSegment = () => {
    setEditingSegment(null);
    setFormData({ name: '', value: '' });
    setErrors({ name: '', value: '' });
    setOpenDialog(true);
  };

  // Abrir diálogo para editar segmento existente
  const handleEditSegment = (segment: Segment) => {
    setEditingSegment(segment);
    setFormData({
      name: segment.name,
      value: segment.value
    });
    setErrors({ name: '', value: '' });
    setOpenDialog(true);
  };

  // Fechar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Atualizar dados do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro do campo
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validar formulário
  const validateForm = () => {
    const newErrors = {
      name: '',
      value: ''
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
      isValid = false;
    }

    if (!formData.value.trim()) {
      newErrors.value = 'Valor é obrigatório';
      isValid = false;
    } else if (!/^[a-z0-9_]+$/.test(formData.value)) {
      newErrors.value = 'Valor deve conter apenas letras minúsculas, números e underscores';
      isValid = false;
    } else if (segments.some(s => s.value === formData.value && s.id !== editingSegment?.id)) {
      newErrors.value = 'Este valor já está em uso';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Salvar segmento (criar ou atualizar)
  const handleSaveSegment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editingSegment) {
        // Atualizar segmento existente
        const updated = await SegmentService.update(editingSegment.id, formData);
        if (updated) {
          setSegments(prev => prev.map(s => s.id === editingSegment.id ? { ...s, ...formData } : s));
          enqueueSnackbar('Segmento atualizado com sucesso', { variant: 'success' });
        }
      } else {
        // Criar novo segmento
        const created = await SegmentService.create(formData);
        if (created) {
          setSegments(prev => [...prev, created]);
          enqueueSnackbar('Segmento criado com sucesso', { variant: 'success' });
        }
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar segmento:', error);
      enqueueSnackbar('Erro ao salvar segmento', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Excluir segmento
  const handleDeleteSegment = async (segment: Segment) => {
    if (window.confirm(`Tem certeza que deseja excluir o segmento "${segment.name}"?`)) {
      setLoading(true);
      try {
        const success = await SegmentService.delete(segment.id);
        if (success) {
          setSegments(prev => prev.filter(s => s.id !== segment.id));
          enqueueSnackbar('Segmento excluído com sucesso', { variant: 'success' });
        }
      } catch (error) {
        console.error('Erro ao excluir segmento:', error);
        enqueueSnackbar('Erro ao excluir segmento', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Importar segmentos padrão
  const handleImportDefaultSegments = async () => {
    setImporting(true);
    try {
      const createdSegments = await SegmentService.importDefaultSegments();
      if (createdSegments.length > 0) {
        setSegments(prev => [...prev, ...createdSegments]);
        enqueueSnackbar(`${createdSegments.length} segmentos importados com sucesso`, { variant: 'success' });
      } else {
        enqueueSnackbar('Todos os segmentos padrão já estão cadastrados', { variant: 'info' });
      }
    } catch (error) {
      console.error('Erro ao importar segmentos padrão:', error);
      enqueueSnackbar('Erro ao importar segmentos padrão', { variant: 'error' });
    } finally {
      setImporting(false);
    }
  };

  // Formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Segmentos de Contratos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              loadSegments(); // Recarregar segmentos ao abrir o modal
              setOpenListModal(true);
            }}
            startIcon={<CategoryIcon />}
            disabled={loading || importing}
            sx={{
              borderRadius: '10px',
              fontWeight: 600,
            }}
          >
            <Badge badgeContent={segments.length} color="primary" sx={{ mr: 1 }}>
              <span>Ver Segmentos</span>
            </Badge>
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={async () => {
              await handleImportDefaultSegments();
              // Recarregar segmentos após importação
              loadSegments();
            }}
            startIcon={importing ? <CircularProgress size={20} color="secondary" /> : <CloudDownloadIcon />}
            disabled={loading || importing}
            sx={{
              borderRadius: '10px',
              fontWeight: 600,
            }}
          >
            Importar Lista Padrão
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSegment}
            disabled={loading || importing}
            sx={{
              borderRadius: '10px',
              fontWeight: 600,
              boxShadow: '0 4px 10px rgba(0, 122, 255, 0.3)',
            }}
          >
            Novo Segmento
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mt: 2 }}>
        Os segmentos cadastrados estarão disponíveis no formulário de cadastro de empresas.
      </Alert>
      
      {/* Modal de listagem de segmentos */}
      <Dialog 
        open={openListModal} 
        onClose={() => setOpenListModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {showDefaultSegments ? 'Segmentos Padrão Disponíveis' : 'Segmentos Cadastrados'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!showDefaultSegments && (
                <Button
                  variant="outlined"
                  color="info"
                  onClick={() => {
                    console.log('Clicou em Ver Segmentos Padrão');
                    setShowDefaultSegments(true);
                    console.log('Estado showDefaultSegments alterado para:', true);
                  }}
                  size="small"
                  sx={{
                    borderRadius: '10px',
                    fontWeight: 600,
                  }}
                >
                  Ver Segmentos Padrão
                </Button>
              )}
              {showDefaultSegments && (
                <Button
                  variant="outlined"
                  color="info"
                  onClick={() => {
                    console.log('Clicou em Ver Segmentos Cadastrados');
                    setShowDefaultSegments(false);
                    console.log('Estado showDefaultSegments alterado para:', false);
                  }}
                  size="small"
                  sx={{
                    borderRadius: '10px',
                    fontWeight: 600,
                  }}
                >
                  Ver Segmentos Cadastrados
                </Button>
              )}
              <Button
                variant="outlined"
                color="secondary"
                onClick={async () => {
                  await handleImportDefaultSegments();
                  // Recarregar segmentos após importação
                  loadSegments();
                }}
                startIcon={importing ? <CircularProgress size={16} color="secondary" /> : <CloudDownloadIcon />}
                disabled={loading || importing}
                size="small"
                sx={{
                  borderRadius: '10px',
                  fontWeight: 600,
                }}
              >
                Importar Lista
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setOpenListModal(false);
                  handleAddSegment();
                }}
                disabled={loading || importing}
                size="small"
                sx={{
                  borderRadius: '10px',
                  fontWeight: 600,
                }}
              >
                Novo Segmento
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Valor</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Criado em</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Atualizado em</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Verificando qual lista exibir baseado no estado */}
                {showDefaultSegments ? (
                  // Exibindo segmentos padrão
                  defaultSegmentsList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          Carregando segmentos padrão...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    defaultSegmentsList.map((segment) => (
                      <TableRow key={segment.id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } }}>
                        <TableCell>{segment.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={segment.value}
                            size="small"
                            sx={{
                              borderRadius: '8px',
                              backgroundColor: 'rgba(156, 39, 176, 0.08)',
                              color: '#9C27B0',
                              border: '1px solid rgba(156, 39, 176, 0.2)',
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>Segmento Padrão</TableCell>
                        <TableCell>Segmento Padrão</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Tooltip title="Adicionar ao Sistema">
                              <IconButton
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(46, 125, 50, 0.08)',
                                  '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.12)' }
                                }}
                                onClick={async () => {
                                  setLoading(true);
                                  try {
                                    const created = await SegmentService.create({
                                      name: segment.name,
                                      value: segment.value
                                    });
                                    if (created) {
                                      setSegments(prev => [...prev, created]);
                                      enqueueSnackbar(`Segmento "${segment.name}" adicionado com sucesso`, { variant: 'success' });
                                      setShowDefaultSegments(false); // Voltar para a lista de segmentos cadastrados
                                    }
                                  } catch (error) {
                                    console.error('Erro ao adicionar segmento:', error);
                                    enqueueSnackbar('Erro ao adicionar segmento', { variant: 'error' });
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                              >
                                <AddIcon fontSize="small" sx={{ color: '#2E7D32' }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                ) : (
                  // Exibindo segmentos cadastrados
                  loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={40} />
                      </TableCell>
                    </TableRow>
                  ) : segments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          Nenhum segmento cadastrado.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    segments.map((segment) => (
                      <TableRow key={segment.id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } }}>
                        <TableCell>{segment.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={segment.value}
                            size="small"
                            sx={{
                              borderRadius: '8px',
                              backgroundColor: 'rgba(156, 39, 176, 0.08)',
                              color: '#9C27B0',
                              border: '1px solid rgba(156, 39, 176, 0.2)',
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>{formatDate(segment.createdAt)}</TableCell>
                        <TableCell>{formatDate(segment.updatedAt)}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.12)' }
                                }}
                                onClick={() => {
                                  setOpenListModal(false);
                                  handleEditSegment(segment);
                                }}
                              >
                                <EditIcon fontSize="small" sx={{ color: '#1976D2' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                                  '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.12)' }
                                }}
                                onClick={() => handleDeleteSegment(segment)}
                              >
                                <DeleteIcon fontSize="small" sx={{ color: '#D32F2F' }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenListModal(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de criar/editar segmento */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSegment ? 'Editar Segmento' : 'Novo Segmento'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nome do Segmento"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            disabled={loading}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Valor (identificador)"
            name="value"
            value={formData.value}
            onChange={handleChange}
            error={!!errors.value}
            helperText={errors.value || "Use apenas letras minúsculas, números e underscores (ex: comercio_varejista)"}
            disabled={loading}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSegment}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SegmentsSection;

import React, { useState, useEffect } from 'react';
import AppleLayout from '../../components/Layout/AppleLayout';
import CompanyModal from '../../components/Company/CompanyModal';
import CompanyService, { Company as ServiceCompany } from '../../services/company.service';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CloudUpload as CloudUploadIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Interface para documento
interface ConsultantDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  fileUrl: string;
  size?: string; // Tamanho do arquivo
  extension?: string; // Extensão do arquivo
}

// Interface para empresa no contexto do consultor
interface ConsultantCompany {
  id: string;
  name: string;
  cnpj: string;
  activationDate: string;
  renewalDate: string;
  documents: ConsultantDocument[];
  pendingDocuments: string[];
  status: 'active' | 'pending' | 'renewal';
}



const ConsultantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<ConsultantCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    pendingClients: 0,
    renewalClients: 0
  });
  const [companyModal, setCompanyModal] = useState<{open: boolean, company?: ServiceCompany}>({ open: false });
  const [uploadDocumentDialog, setUploadDocumentDialog] = useState<{open: boolean, companyId: string | null}>({
    open: false,
    companyId: null
  });
  const [companyDetailsDialog, setCompanyDetailsDialog] = useState<{open: boolean, company: ConsultantCompany | null}>({
    open: false,
    company: null
  });
  const [newCompanyLoading, setNewCompanyLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentType: '',
    file: null as File | null
  });

  // Carregar dados simulados
  useEffect(() => {
    // Simulação de carregamento de dados
    setTimeout(() => {
      const mockCompanies: ConsultantCompany[] = [
        {
          id: '1',
          name: 'Empresa ABC Ltda',
          cnpj: '12.345.678/0001-90',
          activationDate: '2024-01-15',
          renewalDate: '2025-01-15',
          documents: [
            { id: '1', name: 'Contrato.pdf', type: 'Contrato', uploadDate: '2024-01-10', fileUrl: '/documents/contrato1.pdf' },
            { id: '2', name: 'CNPJ.pdf', type: 'CNPJ', uploadDate: '2024-01-10', fileUrl: '/documents/cnpj1.pdf' }
          ],
          pendingDocuments: [],
          status: 'active'
        },
        {
          id: '2',
          name: 'XYZ Tecnologia S.A.',
          cnpj: '98.765.432/0001-10',
          activationDate: '2024-02-20',
          renewalDate: '2025-02-20',
          documents: [
            { id: '3', name: 'Contrato.pdf', type: 'Contrato', uploadDate: '2024-02-15', fileUrl: '/documents/contrato2.pdf' }
          ],
          pendingDocuments: ['CNPJ', 'Comprovante de Endereço'],
          status: 'pending'
        },
        {
          id: '3',
          name: 'Telecom Solutions Ltda',
          cnpj: '45.678.901/0001-23',
          activationDate: '2023-06-10',
          renewalDate: '2024-06-10',
          documents: [
            { id: '4', name: 'Contrato.pdf', type: 'Contrato', uploadDate: '2023-06-05', fileUrl: '/documents/contrato3.pdf' },
            { id: '5', name: 'CNPJ.pdf', type: 'CNPJ', uploadDate: '2023-06-05', fileUrl: '/documents/cnpj3.pdf' },
            { id: '6', name: 'Comprovante.pdf', type: 'Comprovante de Endereço', uploadDate: '2023-06-05', fileUrl: '/documents/comprovante3.pdf' }
          ],
          pendingDocuments: ['Termo de Renovação'],
          status: 'renewal'
        },
        {
          id: '4',
          name: 'Inovação Digital S.A.',
          cnpj: '56.789.012/0001-45',
          activationDate: '2024-03-05',
          renewalDate: '2025-03-05',
          documents: [
            { id: '7', name: 'Contrato.pdf', type: 'Contrato', uploadDate: '2024-03-01', fileUrl: '/documents/contrato4.pdf' },
            { id: '8', name: 'CNPJ.pdf', type: 'CNPJ', uploadDate: '2024-03-01', fileUrl: '/documents/cnpj4.pdf' }
          ],
          pendingDocuments: [],
          status: 'active'
        },
        {
          id: '5',
          name: 'Conecta Telecom Ltda',
          cnpj: '34.567.890/0001-12',
          activationDate: '2023-09-15',
          renewalDate: '2024-09-15',
          documents: [
            { id: '9', name: 'Contrato.pdf', type: 'Contrato', uploadDate: '2023-09-10', fileUrl: '/documents/contrato5.pdf' }
          ],
          pendingDocuments: ['CNPJ', 'Comprovante de Endereço'],
          status: 'pending'
        }
      ];

      setCompanies(mockCompanies);
      
      // Calcular estatísticas
      const totalClients = mockCompanies.length;
      const pendingClients = mockCompanies.filter(company => company.status === 'pending').length;
      const renewalClients = mockCompanies.filter(company => company.status === 'renewal').length;
      
      setStats({
        totalClients,
        pendingClients,
        renewalClients
      });
      
      setLoading(false);
    }, 1000);
  }, []);

  // Função para abrir o modal de nova contratação
  const handleNewCompanyDialogOpen = () => {
    setCompanyModal({ open: true });
  };

  // Função para fechar o modal de nova contratação
  const handleNewCompanyDialogClose = () => {
    setCompanyModal({ open: false });
  };

  const handleUploadDialogOpen = (companyId: string) => {
    setUploadDocumentDialog({
      open: true,
      companyId
    });
  };

  const handleUploadDialogClose = () => {
    setUploadDocumentDialog({
      open: false,
      companyId: null
    });
    setUploadForm({
      documentType: '',
      file: null
    });
  };

  const handleCompanyDetailsOpen = (company: ConsultantCompany) => {
    setCompanyDetailsDialog({
      open: true,
      company
    });
  };

  const handleCompanyDetailsClose = () => {
    setCompanyDetailsDialog({
      open: false,
      company: null
    });
  };



  const handleUploadFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setUploadForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm(prev => ({
        ...prev,
        file: e.target.files![0]
      }));
    }
  };

  // Função para criar ou atualizar uma empresa
  const handleCreateOrUpdate = (companyData: any) => {
    setNewCompanyLoading(true);
    
    // Calcular data de renovação se não foi fornecida
    const renewalDate = companyData.renewalDate || 
      (companyData.activationDate ? 
        new Date(new Date(companyData.activationDate).setFullYear(new Date(companyData.activationDate).getFullYear() + 1)).toISOString().split('T')[0] : '');
    
    try {
      // Verificar se é uma atualização ou criação
      if (companyModal.company) {
        // Atualizar empresa existente (simulação)
        const updatedCompany: ConsultantCompany = {
          id: companyModal.company.id,
          name: companyData.corporateName || '',
          cnpj: companyData.cnpj || '',
          activationDate: companyData.activationDate || '',
          renewalDate: renewalDate,
          documents: [],
          pendingDocuments: [],
          status: 'active'
        };
        
        // Atualizar a empresa na lista
        setCompanies(prev => prev.map(company => 
          company.id === updatedCompany.id ? updatedCompany : company
        ));
        
        // Simular um delay de API
        setTimeout(() => {
          setNewCompanyLoading(false);
          setCompanyModal({ open: false });
        }, 1000);
      } else {
        // Criar nova empresa
        const newCompany: ConsultantCompany = {
          id: (companies.length + 1).toString(),
          name: companyData.corporateName || '', // Usando corporateName como name para compatibilidade
          cnpj: companyData.cnpj || '',
          activationDate: companyData.activationDate || '',
          renewalDate: renewalDate,
          documents: [],
          pendingDocuments: ['Contrato', 'CNPJ', 'Comprovante de Endereço'],
          status: 'pending'
        };
        
        // Simular um delay de API
        setTimeout(() => {
          setCompanies(prev => [...prev, newCompany]);
          setStats(prev => ({
            ...prev,
            totalClients: prev.totalClients + 1,
            pendingClients: prev.pendingClients + 1
          }));
          
          setNewCompanyLoading(false);
          setCompanyModal({ open: false });
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      setNewCompanyLoading(false);
    }
  };

  const handleUploadSubmit = () => {
    if (!uploadDocumentDialog.companyId || !uploadForm.documentType || !uploadForm.file) return;
    
    // Simulação de upload de documento
    const newDocument: ConsultantDocument = {
      id: Math.random().toString(36).substring(2, 11),
      name: uploadForm.file.name,
      type: uploadForm.documentType,
      uploadDate: new Date().toISOString().split('T')[0],
      fileUrl: `/documents/${uploadForm.file.name}`
    };
    
    // Atualizar a empresa com o novo documento
    setCompanies(prev => prev.map(company => {
      if (company.id === uploadDocumentDialog.companyId) {
        // Remover o tipo de documento da lista de pendências
        const updatedPendingDocuments = company.pendingDocuments.filter(
          doc => doc !== uploadForm.documentType
        );
        
        // Determinar o novo status com base nas pendências
        let newStatus = company.status;
        if (updatedPendingDocuments.length === 0) {
          newStatus = company.status === 'renewal' ? 'active' : 'active';
        }
        
        return {
          ...company,
          documents: [...company.documents, newDocument],
          pendingDocuments: updatedPendingDocuments,
          status: newStatus
        };
      }
      return company;
    }));
    
    // Atualizar estatísticas se necessário
    updateStats();
    
    handleUploadDialogClose();
  };

  const updateStats = () => {
    const totalClients = companies.length;
    const pendingClients = companies.filter(company => company.status === 'pending').length;
    const renewalClients = companies.filter(company => company.status === 'renewal').length;
    
    setStats({
      totalClients,
      pendingClients,
      renewalClients
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#2e7d32'; // Verde
      case 'pending':
        return '#ed6c02'; // Laranja
      case 'renewal':
        return '#0288d1'; // Azul
      default:
        return '#757575'; // Cinza
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'pending':
        return 'Pendente';
      case 'renewal':
        return 'Renovação';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AppleLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Painel do Consultor
          </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
            sx={{
              borderRadius: '10px',
              fontWeight: 500,
            }}
          >
            Atualizar
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCompanyModal({ open: true })}
            sx={{
              borderRadius: '10px',
              fontWeight: 600,
              px: 3,
              boxShadow: '0 4px 10px rgba(0, 122, 255, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 15px rgba(0, 122, 255, 0.4)',
              }
            }}
          >
            Nova Contratação
          </Button>
        </Box>
      </Box>
      
      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">
                Total de Clientes
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon sx={{ color: '#0288d1', mr: 1 }} />
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
                  {stats.totalClients}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">
                Pendências
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ color: '#ed6c02', mr: 1 }} />
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 600, color: '#ed6c02' }}>
                  {stats.pendingClients}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#e8f5e9', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">
                Renovações
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <RefreshIcon sx={{ color: '#2e7d32', mr: 1 }} />
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 600, color: '#2e7d32' }}>
                  {stats.renewalClients}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabela de Empresas */}
      <Paper sx={{ mb: 3 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>
              <TableRow>
                <TableCell>Empresa</TableCell>
                <TableCell>CNPJ</TableCell>
                <TableCell>Data de Ativação</TableCell>
                <TableCell>Data de Renovação</TableCell>
                <TableCell>Documentos Anexados</TableCell>
                <TableCell>Pendências</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.cnpj}</TableCell>
                  <TableCell>{formatDate(company.activationDate)}</TableCell>
                  <TableCell>{formatDate(company.renewalDate)}</TableCell>
                  <TableCell>
                    {company.documents.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {company.documents.map((doc) => (
                          <Chip
                            key={doc.id}
                            label={doc.type}
                            size="small"
                            sx={{ bgcolor: '#e3f2fd', color: '#0288d1' }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nenhum documento
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {company.pendingDocuments.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {company.pendingDocuments.map((doc, index) => (
                          <Chip
                            key={index}
                            label={doc}
                            size="small"
                            sx={{ bgcolor: '#ffebee', color: '#d32f2f' }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Chip
                        label="Completo"
                        size="small"
                        icon={<CheckCircleIcon fontSize="small" />}
                        sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(company.status)}
                      size="small"
                      sx={{
                        bgcolor: `${getStatusColor(company.status)}20`,
                        color: getStatusColor(company.status),
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title="Visualizar Detalhes">
                        <IconButton 
                          size="small" 
                          sx={{ mr: 1 }}
                          onClick={() => handleCompanyDetailsOpen(company)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          sx={{ 
                            mr: 1,
                            backgroundColor: 'rgba(237, 108, 2, 0.08)', 
                            '&:hover': { backgroundColor: 'rgba(237, 108, 2, 0.12)' }
                          }}
                        >
                          <EditIcon fontSize="small" sx={{ color: '#ED6C02' }} />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Adicionar Documento">
                        <IconButton
                          size="small"
                          sx={{ 
                            mr: 1,
                            backgroundColor: 'rgba(2, 136, 209, 0.08)', 
                            '&:hover': { backgroundColor: 'rgba(2, 136, 209, 0.12)' }
                          }}
                          onClick={() => handleUploadDialogOpen(company.id)}
                        >
                          <CloudUploadIcon fontSize="small" sx={{ color: '#0288d1' }} />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(211, 47, 47, 0.08)', 
                            '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.12)' }
                          }}
                        >
                          <DeleteIcon fontSize="small" sx={{ color: '#d32f2f' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              
              {companies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="textSecondary">
                      Nenhuma empresa encontrada
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Modal de Nova Contratação */}
      <CompanyModal
        open={companyModal.open}
        onClose={() => setCompanyModal({ open: false })}
        onSave={handleCreateOrUpdate}
        company={companyModal.company}
        loading={newCompanyLoading}
      />
      
      {/* Modal de Upload de Documento */}
      <Dialog open={uploadDocumentDialog.open} onClose={handleUploadDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Documento</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="document-type-label">Tipo de Documento</InputLabel>
                  <Select
                    labelId="document-type-label"
                    name="documentType"
                    value={uploadForm.documentType}
                    onChange={handleUploadFormChange as any}
                    label="Tipo de Documento"
                  >
                    <MenuItem value="Contrato">Contrato</MenuItem>
                    <MenuItem value="CNPJ">CNPJ</MenuItem>
                    <MenuItem value="Comprovante de Endereço">Comprovante de Endereço</MenuItem>
                    <MenuItem value="Termo de Renovação">Termo de Renovação</MenuItem>
                    <MenuItem value="Outro">Outro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  {uploadForm.file ? uploadForm.file.name : 'Selecionar arquivo'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    hidden
                    onChange={handleFileChange}
                  />
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadDialogClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleUploadSubmit}
            variant="contained"
            color="primary"
            disabled={!uploadForm.documentType || !uploadForm.file}
          >
            Enviar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Detalhes da Empresa e Documentos */}
      <Dialog 
        open={companyDetailsDialog.open} 
        onClose={handleCompanyDetailsClose} 
        maxWidth="md" 
        fullWidth
      >
        {companyDetailsDialog.company && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{companyDetailsDialog.company.name}</Typography>
                <Chip
                  label={getStatusText(companyDetailsDialog.company.status)}
                  size="small"
                  sx={{
                    bgcolor: `${getStatusColor(companyDetailsDialog.company.status)}20`,
                    color: getStatusColor(companyDetailsDialog.company.status),
                    fontWeight: 500
                  }}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Informações da Empresa */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Informações da Empresa
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">CNPJ</Typography>
                    <Typography variant="body1">{companyDetailsDialog.company.cnpj}</Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Data de Ativação</Typography>
                    <Typography variant="body1">{formatDate(companyDetailsDialog.company.activationDate)}</Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Data de Renovação</Typography>
                    <Typography variant="body1">{formatDate(companyDetailsDialog.company.renewalDate)}</Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Pendências</Typography>
                    {companyDetailsDialog.company.pendingDocuments.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {companyDetailsDialog.company.pendingDocuments.map((doc, index) => (
                          <Chip
                            key={index}
                            label={doc}
                            size="small"
                            sx={{ bgcolor: '#ffebee', color: '#d32f2f' }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Chip
                        label="Completo"
                        size="small"
                        icon={<CheckCircleIcon fontSize="small" />}
                        sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                      />
                    )}
                  </Box>
                </Grid>
                
                {/* Documentos */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Documentos
                    </Typography>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CloudUploadIcon />}
                      onClick={() => {
                        if (companyDetailsDialog.company) {
                          handleCompanyDetailsClose();
                          handleUploadDialogOpen(companyDetailsDialog.company.id);
                        }
                      }}
                    >
                      Adicionar
                    </Button>
                  </Box>
                  
                  {companyDetailsDialog.company.documents.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Documento</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Data</TableCell>
                            <TableCell align="right">Ações</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {companyDetailsDialog.company.documents.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {doc.name.endsWith('.pdf') ? (
                                    <Box component="span" sx={{ color: '#f44336', mr: 1, display: 'flex' }}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-9.5 8.5c0 .8-.7 1.5-1.5 1.5H7v2H5.5V9H8c.8 0 1.5.7 1.5 1.5v1m5 2c0 .8-.7 1.5-1.5 1.5h-2.5V9H13c.8 0 1.5.7 1.5 1.5v3m4-3H17v1h1.5V13H17v2h-1.5V9h3v1.5m-6.5 0h1v3h-1v-3m-5 0h1v1H7v-1Z"/></svg>
                                    </Box>
                                  ) : doc.name.endsWith('.doc') || doc.name.endsWith('.docx') ? (
                                    <Box component="span" sx={{ color: '#2196f3', mr: 1, display: 'flex' }}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M21.17 3.25q.33 0 .59.25q.24.24.24.58v15.84q0 .34-.24.58q-.26.25-.59.25H7.83q-.33 0-.59-.25q-.24-.24-.24-.58V17H2.83q-.33 0-.59-.25q-.24-.24-.24-.58V7.83q0-.34.24-.58q.26-.25.59-.25H7v-3.17q0-.34.24-.58q.26-.25.59-.25M7 7.83H2.83v8.34H7Zm14.17-3.75H7.83v3.17H7v8.33h.83v3.17h13.34Z"/></svg>
                                    </Box>
                                  ) : (
                                    <Box component="span" sx={{ color: '#ff9800', mr: 1, display: 'flex' }}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                                    </Box>
                                  )}
                                  <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                    {doc.name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{doc.type}</TableCell>
                              <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                              <TableCell align="right">
                                <Tooltip title="Download">
                                  <IconButton size="small" onClick={() => window.open(doc.fileUrl, '_blank')}>
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhum documento anexado
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mt: 2 }}
                        onClick={() => {
                          if (companyDetailsDialog.company) {
                            handleCompanyDetailsClose();
                            handleUploadDialogOpen(companyDetailsDialog.company.id);
                          }
                        }}
                      >
                        Adicionar Documento
                      </Button>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCompanyDetailsClose}>Fechar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      </Box>
    </AppleLayout>
  );
};

export default ConsultantDashboard;

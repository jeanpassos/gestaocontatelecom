import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
  useTheme,
  Tooltip,
  Backdrop,
  Tabs,
  Tab,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  CloudUpload as CloudUploadIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import AppleLayout from '../../components/Layout/AppleLayout';
import { useAuth } from '../../context/AuthContext';
import CompanyService, { Company as ServiceCompany } from '../../services/company.service';
import CompanyModal from '../../components/Company/CompanyModal';

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

// Componente para exibir o status da empresa
const StatusChip = ({ status }: { status: string }) => {
  switch (status) {
    case 'active':
      return (
        <Chip 
          label="Ativo" 
          color="success" 
          size="small" 
          icon={<CheckCircleIcon />} 
          sx={{ fontWeight: 500 }}
        />
      );
    case 'pending':
      return (
        <Chip 
          label="Pendente" 
          color="warning" 
          size="small" 
          icon={<WarningIcon />} 
          sx={{ fontWeight: 500 }}
        />
      );
    case 'renewal':
      return (
        <Chip 
          label="Renovação" 
          color="info" 
          size="small" 
          icon={<InfoIcon />} 
          sx={{ fontWeight: 500 }}
        />
      );
    default:
      return (
        <Chip 
          label="Desconhecido" 
          color="default" 
          size="small" 
          sx={{ fontWeight: 500 }}
        />
      );
  }
};

// Componente para o card de estatísticas
const StatCard = ({ title, value, color, icon }: { title: string, value: number, color: string, icon: React.ReactNode }) => {
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }
    }}>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {title}
          </Typography>
          <Box sx={{ 
            backgroundColor: `${color}20`, 
            borderRadius: '50%', 
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {React.cloneElement(icon as React.ReactElement, { sx: { color } })}
          </Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Modal de Upload de Documento
interface UploadDocumentModalProps {
  open: boolean;
  companyId: string | null;
  onClose: () => void;
  onUpload: (companyId: string, documentType: string, file: File) => void;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ 
  open, 
  companyId, 
  onClose, 
  onUpload 
}) => {
  const [documentType, setDocumentType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!companyId || !documentType || !file) {
      return;
    }
    
    setLoading(true);
    
    // Simular upload
    setTimeout(() => {
      onUpload(companyId, documentType, file);
      setLoading(false);
      handleClose();
    }, 1000);
  };

  const handleClose = () => {
    setDocumentType('');
    setFile(null);
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload de Documento</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de Documento</InputLabel>
            <Select
              value={documentType}
              label="Tipo de Documento"
              onChange={(e) => setDocumentType(e.target.value)}
            >
              <MenuItem value="contrato">Contrato</MenuItem>
              <MenuItem value="proposta">Proposta</MenuItem>
              <MenuItem value="identidade">Identidade</MenuItem>
              <MenuItem value="comprovante">Comprovante de Endereço</MenuItem>
              <MenuItem value="outros">Outros</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            fullWidth
            sx={{ mb: 2 }}
          >
            {file ? file.name : 'Selecionar Arquivo'}
            <input
              type="file"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          
          {file && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Arquivo selecionado: {file.name}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!documentType || !file || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Modal de Detalhes da Empresa
interface CompanyDetailsModalProps {
  open: boolean;
  company: ConsultantCompany | null;
  onClose: () => void;
}

const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({ 
  open, 
  company, 
  onClose 
}) => {
  if (!company) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalhes da Empresa</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Nome
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {company.name}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                CNPJ
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {company.cnpj}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Data de Ativação
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {new Date(company.activationDate).toLocaleDateString()}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Data de Renovação
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {new Date(company.renewalDate).toLocaleDateString()}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Box sx={{ mb: 2 }}>
                <StatusChip status={company.status} />
              </Box>
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Documentos
          </Typography>
          
          {company.documents.length > 0 ? (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Data de Upload</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {company.documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.name}</TableCell>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell>{new Date(doc.uploadDate).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Visualizar">
                          <IconButton size="small">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton size="small">
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
            <Alert severity="info" sx={{ mb: 3 }}>
              Nenhum documento encontrado para esta empresa.
            </Alert>
          )}
          
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Documentos Pendentes
          </Typography>
          
          {company.pendingDocuments.length > 0 ? (
            <Box sx={{ mb: 2 }}>
              {company.pendingDocuments.map((doc, index) => (
                <Chip 
                  key={index}
                  label={doc}
                  color="warning"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          ) : (
            <Alert severity="success" sx={{ mb: 2 }}>
              Não há documentos pendentes para esta empresa.
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

// Página Principal do Consultor
const ConsultantDashboard: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState<ConsultantCompany[]>([]);

  // Carregar dados simulados
  useEffect(() => {
    loadCompanies();
  }, []);

  // Filtrar empresas quando o termo de busca mudar
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.cnpj.includes(searchTerm)
      );
      setFilteredCompanies(filtered);
    }
  }, [searchTerm, companies]);

  const loadCompanies = () => {
    setLoading(true);
    
    // Simulação de carregamento de dados
    setTimeout(() => {
      const mockCompanies: ConsultantCompany[] = [
        {
          id: '1',
          name: 'Empresa ABC Ltda',
          cnpj: '12.345.678/0001-90',
          activationDate: '2023-01-15',
          renewalDate: '2024-01-15',
          status: 'active',
          documents: [
            {
              id: 'd1',
              name: 'Contrato.pdf',
              type: 'contrato',
              uploadDate: '2023-01-15',
              fileUrl: '/files/contrato.pdf',
              size: '1.2 MB',
              extension: 'pdf'
            },
            {
              id: 'd2',
              name: 'Proposta.pdf',
              type: 'proposta',
              uploadDate: '2022-12-10',
              fileUrl: '/files/proposta.pdf',
              size: '850 KB',
              extension: 'pdf'
            }
          ],
          pendingDocuments: []
        },
        {
          id: '2',
          name: 'Comércio XYZ',
          cnpj: '98.765.432/0001-21',
          activationDate: '2023-03-20',
          renewalDate: '2024-03-20',
          status: 'pending',
          documents: [
            {
              id: 'd3',
              name: 'Contrato.pdf',
              type: 'contrato',
              uploadDate: '2023-03-20',
              fileUrl: '/files/contrato2.pdf',
              size: '1.5 MB',
              extension: 'pdf'
            }
          ],
          pendingDocuments: ['Comprovante de Endereço', 'Identidade']
        },
        {
          id: '3',
          name: 'Indústria 123',
          cnpj: '45.678.901/0001-23',
          activationDate: '2022-08-10',
          renewalDate: '2023-08-10',
          status: 'renewal',
          documents: [
            {
              id: 'd4',
              name: 'Contrato.pdf',
              type: 'contrato',
              uploadDate: '2022-08-10',
              fileUrl: '/files/contrato3.pdf',
              size: '1.1 MB',
              extension: 'pdf'
            },
            {
              id: 'd5',
              name: 'Identidade.jpg',
              type: 'identidade',
              uploadDate: '2022-08-10',
              fileUrl: '/files/identidade.jpg',
              size: '2.3 MB',
              extension: 'jpg'
            }
          ],
          pendingDocuments: ['Proposta de Renovação']
        }
      ];
      
      setCompanies(mockCompanies);
      setFilteredCompanies(mockCompanies);
      setLoading(false);
      
      // Atualizar estatísticas
      setStats({
        totalClients: mockCompanies.length,
        pendingClients: mockCompanies.filter(c => c.status === 'pending').length,
        renewalClients: mockCompanies.filter(c => c.status === 'renewal').length
      });
    }, 1000);
  };

  const handleOpenCompanyModal = (company?: ServiceCompany) => {
    setCompanyModal({ open: true, company });
  };

  const handleCloseCompanyModal = () => {
    setCompanyModal({ open: false });
  };

  const handleSaveCompany = async (company: Partial<ServiceCompany>) => {
    setNewCompanyLoading(true);
    
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Empresa salva:', company);
      
      // Recarregar dados
      loadCompanies();
      
      // Fechar modal
      handleCloseCompanyModal();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
    } finally {
      setNewCompanyLoading(false);
    }
  };

  const handleOpenUploadDialog = (companyId: string) => {
    setUploadDocumentDialog({ open: true, companyId });
  };

  const handleCloseUploadDialog = () => {
    setUploadDocumentDialog({ open: false, companyId: null });
  };

  const handleUploadDocument = (companyId: string, documentType: string, file: File) => {
    // Simular upload
    console.log('Documento enviado:', { companyId, documentType, fileName: file.name });
    
    // Atualizar lista de empresas
    const updatedCompanies = companies.map(company => {
      if (company.id === companyId) {
        // Adicionar novo documento
        const newDocument: ConsultantDocument = {
          id: `d${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: documentType,
          uploadDate: new Date().toISOString(),
          fileUrl: `/files/${file.name}`,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          extension: file.name.split('.').pop() || ''
        };
        
        // Remover dos documentos pendentes se aplicável
        let pendingDocuments = [...company.pendingDocuments];
        if (documentType === 'contrato') {
          pendingDocuments = pendingDocuments.filter(doc => doc !== 'Contrato');
        } else if (documentType === 'proposta') {
          pendingDocuments = pendingDocuments.filter(doc => doc !== 'Proposta');
        } else if (documentType === 'identidade') {
          pendingDocuments = pendingDocuments.filter(doc => doc !== 'Identidade');
        } else if (documentType === 'comprovante') {
          pendingDocuments = pendingDocuments.filter(doc => doc !== 'Comprovante de Endereço');
        }
        
        return {
          ...company,
          documents: [...company.documents, newDocument],
          pendingDocuments,
          // Atualizar status se não houver mais documentos pendentes
          status: pendingDocuments.length === 0 ? 'active' : company.status
        };
      }
      return company;
    });
    
    setCompanies(updatedCompanies);
    
    // Atualizar estatísticas
    setStats({
      totalClients: updatedCompanies.length,
      pendingClients: updatedCompanies.filter(c => c.status === 'pending').length,
      renewalClients: updatedCompanies.filter(c => c.status === 'renewal').length
    });
  };

  const handleOpenCompanyDetails = (company: ConsultantCompany) => {
    setCompanyDetailsDialog({ open: true, company });
  };

  const handleCloseCompanyDetails = () => {
    setCompanyDetailsDialog({ open: false, company: null });
  };

  return (
    <AppleLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Painel do Consultor
          </Typography>
          
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenCompanyModal()}
              sx={{ mr: 1 }}
            >
              Nova Contratação
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadCompanies}
              disabled={loading}
            >
              Atualizar
            </Button>
          </Box>
        </Box>
        
        {/* Cards de estatísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <StatCard 
              title="Total de Clientes" 
              value={stats.totalClients} 
              color={theme.palette.primary.main} 
              icon={<BusinessIcon fontSize="medium" />} 
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <StatCard 
              title="Clientes Pendentes" 
              value={stats.pendingClients} 
              color={theme.palette.warning.main} 
              icon={<WarningIcon />} 
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <StatCard 
              title="Renovações Próximas" 
              value={stats.renewalClients} 
              color={theme.palette.info.main} 
              icon={<InfoIcon />} 
            />
          </Grid>
        </Grid>
        
        {/* Barra de pesquisa */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Buscar por nome ou CNPJ"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>
        
        {/* Tabela de empresas */}
        <Paper sx={{ 
          borderRadius: '12px', 
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableRow>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Nome</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>CNPJ</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Ativação</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Renovação</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Documentos</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        Nenhuma empresa encontrada
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id} hover>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{company.cnpj}</TableCell>
                      <TableCell>{new Date(company.activationDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(company.renewalDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <StatusChip status={company.status} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {company.documents.length}
                          </Typography>
                          {company.pendingDocuments.length > 0 && (
                            <Chip 
                              label={`${company.pendingDocuments.length} pendentes`} 
                              color="warning" 
                              size="small" 
                              sx={{ fontWeight: 500 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Ver detalhes">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenCompanyDetails(company)}
                            sx={{ mr: 1 }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Upload de documento">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenUploadDialog(company.id)}
                            sx={{ mr: 1 }}
                          >
                            <CloudUploadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Editar">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenCompanyModal({
                              id: company.id,
                              corporateName: company.name,
                              cnpj: company.cnpj,
                              contractDate: company.activationDate,
                              renewalDate: company.renewalDate,
                              phoneLines: [],
                              assets: {}
                            } as ServiceCompany)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
      
      {/* Modal de Nova Contratação / Edição */}
      <CompanyModal
        open={companyModal.open}
        onClose={handleCloseCompanyModal}
        onSave={handleSaveCompany}
        company={companyModal.company}
        loading={newCompanyLoading}
      />
      
      {/* Modal de Upload de Documento */}
      <UploadDocumentModal
        open={uploadDocumentDialog.open}
        companyId={uploadDocumentDialog.companyId}
        onClose={handleCloseUploadDialog}
        onUpload={handleUploadDocument}
      />
      
      {/* Modal de Detalhes da Empresa */}
      <CompanyDetailsModal
        open={companyDetailsDialog.open}
        company={companyDetailsDialog.company}
        onClose={handleCloseCompanyDetails}
      />
    </AppleLayout>
  );
};

export default ConsultantDashboard;

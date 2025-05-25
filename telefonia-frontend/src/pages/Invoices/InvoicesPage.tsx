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
  SelectChangeEvent
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
  Search as SearchIcon
} from '@mui/icons-material';
import AppleLayout from '../../components/Layout/AppleLayout';
import { useAuth } from '../../context/AuthContext';
import InvoiceService, { Invoice, InvoiceFilter } from '../../services/invoice.service';
import CompanyService from '../../services/company.service';

// Componente de Status de Fatura
const StatusChip = ({ status }: { status: string }) => {
  const theme = useTheme();
  
  const getStatusConfig = () => {
    switch (status) {
      case 'paid':
        return { label: 'Pago', color: theme.palette.success.main, backgroundColor: 'rgba(52, 199, 89, 0.1)' };
      case 'pending':
        return { label: 'Pendente', color: theme.palette.info.main, backgroundColor: 'rgba(0, 122, 255, 0.1)' };
      case 'overdue':
        return { label: 'Vencido', color: theme.palette.error.main, backgroundColor: 'rgba(255, 59, 48, 0.1)' };
      case 'canceled':
        return { label: 'Cancelado', color: theme.palette.text.secondary, backgroundColor: 'rgba(142, 142, 147, 0.1)' };
      default:
        return { label: status, color: theme.palette.text.primary, backgroundColor: 'rgba(0, 0, 0, 0.05)' };
    }
  };
  
  const { label, color, backgroundColor } = getStatusConfig();
  
  return (
    <Chip
      label={label}
      sx={{
        color,
        backgroundColor,
        fontWeight: 600,
        borderRadius: '8px',
        '& .MuiChip-label': {
          px: 1.5,
        }
      }}
      size="small"
    />
  );
};

// Componente de Status de Operadora
const ProviderChip = ({ provider }: { provider: string }) => {
  const getProviderConfig = () => {
    switch (provider) {
      case 'vivo':
        return { label: 'Vivo', color: '#0066CC', backgroundColor: 'rgba(0, 102, 204, 0.1)' };
      case 'claro':
        return { label: 'Claro', color: '#FF0000', backgroundColor: 'rgba(255, 0, 0, 0.1)' };
      case 'tim':
        return { label: 'TIM', color: '#0000FF', backgroundColor: 'rgba(0, 0, 255, 0.1)' };
      case 'oi':
        return { label: 'Oi', color: '#FFA500', backgroundColor: 'rgba(255, 165, 0, 0.1)' };
      default:
        return { label: provider, color: '#999999', backgroundColor: 'rgba(153, 153, 153, 0.1)' };
    }
  };
  
  const { label, color, backgroundColor } = getProviderConfig();
  
  return (
    <Chip
      label={label}
      sx={{
        color,
        backgroundColor,
        fontWeight: 600,
        borderRadius: '8px',
        '& .MuiChip-label': {
          px: 1.5,
        }
      }}
      size="small"
    />
  );
};

// Modal de Upload de Fatura
interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File, companyId: string, provider: string) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ open, onClose, onUpload }) => {
  const theme = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [companies, setCompanies] = useState<Array<{id: string, corporateName: string}>>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("vivo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  // Carregar empresas quando o modal for aberto
  useEffect(() => {
    if (open) {
      const loadCompanies = async () => {
        setLoading(true);
        setError(null);
        try {
          const companiesData = await CompanyService.getAll();
          setCompanies(companiesData);
          if (companiesData.length > 0) {
            setSelectedCompany(companiesData[0].id);
          }
        } catch (err) {
          console.error('Erro ao carregar empresas:', err);
          setError('Não foi possível carregar a lista de empresas.');
        } finally {
          setLoading(false);
        }
      };
      
      loadCompanies();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (file && selectedCompany) {
      setUploading(true);
      try {
        await onUpload(file, selectedCompany, selectedProvider);
        onClose();
      } catch (error) {
        console.error('Erro ao fazer upload:', error);
      } finally {
        setUploading(false);
      }
    }
  };
  
  const handleCompanyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCompany(event.target.value);
  };
  
  const handleProviderChange = (event: SelectChangeEvent) => {
    setSelectedProvider(event.target.value);
  };
  
  return (
    <Dialog open={open} onClose={uploading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
        <Typography variant="h6">Upload de Fatura</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Selecione a empresa e a operadora para a qual deseja enviar a fatura
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Faça upload de um arquivo PDF para processamento automático.
          </Typography>
        </Box>
        
        {/* Seleção de empresa */}
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="company-select-label">Empresa</InputLabel>
            <Select
              labelId="company-select-label"
              id="company-select"
              value={selectedCompany}
              label="Empresa"
              onChange={handleCompanyChange as any}
              disabled={loading || companies.length === 0}
            >
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.corporateName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel id="provider-select-label">Operadora</InputLabel>
            <Select
              labelId="provider-select-label"
              id="provider-select"
              value={selectedProvider}
              label="Operadora"
              onChange={handleProviderChange}
              disabled={loading}
            >
              <MenuItem value="vivo">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: '#660099', 
                    mr: 1 
                  }} />
                  Vivo
                </Box>
              </MenuItem>
              <MenuItem value="claro">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: '#FF0000', 
                    mr: 1 
                  }} />
                  Claro
                </Box>
              </MenuItem>
              <MenuItem value="tim">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: '#004691', 
                    mr: 1 
                  }} />
                  Tim
                </Box>
              </MenuItem>
              <MenuItem value="oi">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: '#FFCD00', 
                    mr: 1 
                  }} />
                  Oi
                </Box>
              </MenuItem>
              <MenuItem value="other">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: '#888888', 
                    mr: 1 
                  }} />
                  Outra
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box
          sx={{
            border: `2px dashed ${dragActive ? theme.palette.primary.main : theme.palette.divider}`,
            borderRadius: '12px',
            p: 4,
            mb: 3,
            textAlign: 'center',
            backgroundColor: dragActive ? 'rgba(0, 122, 255, 0.05)' : 'transparent',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          
          <CloudUploadIcon
            sx={{
              fontSize: 48,
              color: dragActive ? theme.palette.primary.main : theme.palette.text.secondary,
              mb: 2
            }}
          />
          
          <Typography variant="h6" sx={{ mb: 1 }}>
            {file ? file.name : 'Arraste e solte sua fatura PDF aqui'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            {file
              ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
              : 'ou clique para selecionar um arquivo'}
          </Typography>
        </Box>
        
        {file && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Arquivo selecionado: {file.name}
          </Alert>
        )}
        
        {/* Resumo das informações selecionadas */}
        {file && selectedCompany && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 2, 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '10px',
              bgcolor: 'background.paper'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Resumo do Upload
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, width: 120 }}>
                  Empresa:
                </Typography>
                <Typography variant="body2">
                  {companies.find(c => c.id === selectedCompany)?.corporateName || 'Não selecionada'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, width: 120 }}>
                  Operadora:
                </Typography>
                <Chip
                  size="small"
                  label={
                    selectedProvider === 'vivo' ? 'Vivo' :
                    selectedProvider === 'claro' ? 'Claro' :
                    selectedProvider === 'tim' ? 'Tim' :
                    selectedProvider === 'oi' ? 'Oi' : 'Outra'
                  }
                  sx={{
                    bgcolor: 
                      selectedProvider === 'vivo' ? 'rgba(102, 0, 153, 0.1)' :
                      selectedProvider === 'claro' ? 'rgba(255, 0, 0, 0.1)' :
                      selectedProvider === 'tim' ? 'rgba(0, 70, 145, 0.1)' :
                      selectedProvider === 'oi' ? 'rgba(255, 205, 0, 0.1)' : 'rgba(136, 136, 136, 0.1)',
                    color: 
                      selectedProvider === 'vivo' ? '#660099' :
                      selectedProvider === 'claro' ? '#FF0000' :
                      selectedProvider === 'tim' ? '#004691' :
                      selectedProvider === 'oi' ? '#996600' : '#666666',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: 
                      selectedProvider === 'vivo' ? 'rgba(102, 0, 153, 0.3)' :
                      selectedProvider === 'claro' ? 'rgba(255, 0, 0, 0.3)' :
                      selectedProvider === 'tim' ? 'rgba(0, 70, 145, 0.3)' :
                      selectedProvider === 'oi' ? 'rgba(255, 205, 0, 0.3)' : 'rgba(136, 136, 136, 0.3)',
                  }}
                  icon={
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: 
                        selectedProvider === 'vivo' ? '#660099' :
                        selectedProvider === 'claro' ? '#FF0000' :
                        selectedProvider === 'tim' ? '#004691' :
                        selectedProvider === 'oi' ? '#FFCD00' : '#888888'
                    }} />
                  }
                />
              </Box>
            </Box>
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={uploading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!file || !selectedCompany || uploading}
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          sx={{
            px: 3,
            py: 1,
            borderRadius: '10px',
            fontWeight: 600,
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          {uploading ? 'Enviando...' : 
            file && selectedCompany ? 
              `Enviar Fatura para ${companies.find(c => c.id === selectedCompany)?.corporateName.split(' ')[0] || 'Empresa'}` : 
              'Enviar Fatura'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Página Principal de Faturas
const InvoicesPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState<InvoiceFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Contadores para as abas
  const invoiceCounts = {
    pending: allInvoices.filter(i => i.status === 'pending').length,
    paid: allInvoices.filter(i => i.status === 'paid').length,
    overdue: allInvoices.filter(i => i.status === 'overdue').length,
    total: allInvoices.length
  };
  
  // Carregar faturas
  const loadInvoices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Define filtros baseado na tab selecionada
      let statusFilter: 'pending' | 'paid' | 'overdue' | undefined = undefined;
      
      // Aplicar filtro de acordo com a aba selecionada
      if (tabValue === 1) statusFilter = 'pending';
      if (tabValue === 2) statusFilter = 'paid';
      if (tabValue === 3) statusFilter = 'overdue';
      
      // Manter outros filtros, mas substituir o filtro de status
      const updatedFilters = { ...filters };
      
      // Se uma aba específica estiver selecionada, aplicar o filtro de status
      if (statusFilter) {
        updatedFilters.status = statusFilter;
      } else {
        // Se a aba "Todas" estiver selecionada, remover qualquer filtro de status
        delete updatedFilters.status;
      }
      
      console.log(`Carregando faturas com filtros: ${JSON.stringify(updatedFilters)}`);
      
      // Primeiro, vamos buscar todas as faturas sem filtro de status para ter os contadores corretos
      const allFilters = { ...updatedFilters };
      delete allFilters.status;
      
      const allData = await InvoiceService.getAll(allFilters);
      setAllInvoices(allData);
      
      // Agora aplicamos o filtro de status de acordo com a aba selecionada
      let filteredData = allData;
      if (statusFilter) {
        filteredData = allData.filter(invoice => invoice.status === statusFilter);
        console.log(`Filtrando faturas por status: ${statusFilter}. Total: ${allData.length}, Filtradas: ${filteredData.length}`);
      }
      
      setInvoices(filteredData);
      
      // Exibir contagem de faturas por aba no console para debug
      const counts = {
        total: allData.length,
        filtered: filteredData.length,
        pending: allData.filter(i => i.status === 'pending').length,
        paid: allData.filter(i => i.status === 'paid').length,
        overdue: allData.filter(i => i.status === 'overdue').length
      };
      console.log(`Contagem de faturas: ${JSON.stringify(counts)}`);
    } catch (err: any) {
      setError('Erro ao carregar faturas: ' + (err.message || 'Erro desconhecido'));
      console.error('Erro ao carregar faturas:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar faturas quando os filtros ou a tab mudar
  useEffect(() => {
    loadInvoices();
  }, [tabValue, filters]);
  
  // Função para upload de fatura
  const handleUpload = async (file: File, companyId: string, provider: string) => {
    try {
      // Agora passamos a empresa e a operadora selecionadas para o serviço
      await InvoiceService.uploadPdf(file, companyId, user!.id, provider);
      await loadInvoices();
    } catch (err) {
      console.error('Erro ao fazer upload da fatura:', err);
      setError('Erro ao fazer upload da fatura');
    }
  };
  
  // Funções para gerenciar filtros
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name as string]: value
    }));
  };
  
  // Manipular alterações nos filtros de tipo Select
  const handleSelectFilterChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const clearFilters = () => {
    setFilters({});
  };
  
  // Renderizar filtros
  const renderFilters = () => {
    return (
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="provider-label">Operadora</InputLabel>
              <Select
                labelId="provider-label"
                name="provider"
                value={filters.provider || ''}
                label="Operadora"
                onChange={handleSelectFilterChange}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="vivo">Vivo</MenuItem>
                <MenuItem value="claro">Claro</MenuItem>
                <MenuItem value="tim">TIM</MenuItem>
                <MenuItem value="oi">Oi</MenuItem>
                <MenuItem value="other">Outras</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              id="startDate"
              name="startDate"
              label="Data Início"
              type="date"
              size="small"
              value={filters.startDate || ''}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              id="endDate"
              name="endDate"
              label="Data Fim"
              type="date"
              size="small"
              value={filters.endDate || ''}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                sx={{ flex: 1 }}
              >
                Limpar
              </Button>
              <Button
                variant="contained"
                onClick={loadInvoices}
                startIcon={<SearchIcon />}
                sx={{ flex: 1 }}
              >
                Filtrar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };
  
  return (
    <AppleLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Faturas
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{
              borderRadius: '10px',
              fontWeight: 500,
            }}
          >
            Filtros
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadInvoices}
            sx={{
              borderRadius: '10px',
              fontWeight: 500,
            }}
          >
            Atualizar
          </Button>
          
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => setModalOpen(true)}
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
            Upload
          </Button>
        </Box>
      </Box>
      
      {/* Exibir filtros se o botão de filtro for clicado */}
      {showFilters && renderFilters()}
      
      {/* Abas de status */}
      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{ 
          mb: 3,
          '& .MuiTabs-indicator': {
            backgroundColor: theme.palette.primary.main,
            height: 3,
            borderRadius: '3px 3px 0 0'
          }
        }}
      >
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 600 }}>Todas</Typography>
              <Chip 
                label={invoiceCounts.total} 
                size="small" 
                sx={{ 
                  height: 20, 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  bgcolor: tabValue === 0 ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.08)',
                  color: tabValue === 0 ? 'white' : 'text.secondary'
                }} 
              />
            </Box>
          }
          sx={{ 
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            '&.Mui-selected': { color: theme.palette.primary.main }
          }} 
        />
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 600 }}>Pendentes</Typography>
              <Chip 
                label={invoiceCounts.pending} 
                size="small" 
                sx={{ 
                  height: 20, 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  bgcolor: tabValue === 1 ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.08)',
                  color: tabValue === 1 ? 'white' : 'text.secondary'
                }} 
              />
            </Box>
          }
          sx={{ 
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            '&.Mui-selected': { color: theme.palette.primary.main }
          }} 
        />
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 600 }}>Pagas</Typography>
              <Chip 
                label={invoiceCounts.paid} 
                size="small" 
                sx={{ 
                  height: 20, 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  bgcolor: tabValue === 2 ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.08)',
                  color: tabValue === 2 ? 'white' : 'text.secondary'
                }} 
              />
            </Box>
          }
          sx={{ 
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            '&.Mui-selected': { color: theme.palette.primary.main }
          }} 
        />
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 600 }}>Vencidas</Typography>
              <Chip 
                label={invoiceCounts.overdue} 
                size="small" 
                sx={{ 
                  height: 20, 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  bgcolor: tabValue === 3 ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.08)',
                  color: tabValue === 3 ? 'white' : 'text.secondary'
                }} 
              />
            </Box>
          }
          sx={{ 
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            '&.Mui-selected': { color: theme.palette.primary.main }
          }} 
        />
      </Tabs>
      
      {/* Mensagem de erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Tabela de faturas */}
      <Paper
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                <TableCell sx={{ fontWeight: 600 }}>Nº da Fatura</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Operadora</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Valor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Vencimento</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Empresa</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="text.secondary">
                      Nenhuma fatura encontrada.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id} sx={{ 
                    '&:hover': { 
                      backgroundColor: 'rgba(0, 0, 0, 0.02)' 
                    } 
                  }}>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <ProviderChip provider={invoice.provider} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {`R$ ${invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={invoice.status} />
                    </TableCell>
                    <TableCell>
                      {invoice.company.corporateName}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        {/* Azul para Visualizar - representa visibilidade, informação */}
                        <Tooltip title="Visualizar">
                          <IconButton 
                            size="small"
                            sx={{ 
                              backgroundColor: 'rgba(25, 118, 210, 0.08)', 
                              '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.12)' } 
                            }}
                          >
                            <VisibilityIcon fontSize="small" sx={{ color: '#1976D2' }} />
                          </IconButton>
                        </Tooltip>
                        
                        {/* Verde para Download - representa sucesso, transferência */}
                        <Tooltip title="Baixar PDF">
                          <IconButton
                            size="small"
                            disabled={!invoice.pdfUrl}
                            onClick={() => {
                              if (invoice.pdfUrl) window.open(invoice.pdfUrl, '_blank');
                            }}
                            sx={{ 
                              backgroundColor: invoice.pdfUrl ? 'rgba(46, 125, 50, 0.08)' : 'transparent', 
                              '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.12)' },
                              opacity: invoice.pdfUrl ? 1 : 0.5
                            }}
                          >
                            <DownloadIcon fontSize="small" sx={{ color: '#2E7D32' }} />
                          </IconButton>
                        </Tooltip>
                        
                        {/* Laranja para Editar - representa modificação, atenção */}
                        <Tooltip title="Editar">
                          <IconButton 
                            size="small"
                            sx={{ 
                              backgroundColor: 'rgba(237, 108, 2, 0.08)', 
                              '&:hover': { backgroundColor: 'rgba(237, 108, 2, 0.12)' } 
                            }}
                          >
                            <EditIcon fontSize="small" sx={{ color: '#ED6C02' }} />
                          </IconButton>
                        </Tooltip>
                        
                        {/* Vermelho para Excluir - representa perigo, exclusão */}
                        <Tooltip title="Excluir">
                          <IconButton 
                            size="small"
                            sx={{ 
                              backgroundColor: 'rgba(211, 47, 47, 0.08)', 
                              '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.12)' } 
                            }}
                          >
                            <DeleteIcon fontSize="small" sx={{ color: '#D32F2F' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Modal de Upload */}
      <UploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpload={handleUpload}
      />
    </AppleLayout>
  );
};

export default InvoicesPage;

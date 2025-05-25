import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  CloudUpload as CloudUploadIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
// Usando formatação nativa de datas do JavaScript

// Interface para a empresa
interface Company {
  id: string;
  corporateName: string;
  tradeName?: string;
  cnpj: string;
  address?: string;
  phone?: string;
  email?: string;
  active: boolean;
}

// Interface para faturas
interface Invoice {
  id: string;
  companyId: string;
  month: string;
  year: number;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface para estatísticas
interface Stats {
  totalInvoices: number;
  pendingInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalAmount: number;
}

const ConsultantPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalInvoices: 0,
    pendingInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    totalAmount: 0
  });
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    month: '',
    year: new Date().getFullYear(),
    dueDate: '',
    amount: 0,
    file: null as File | null
  });

  // Simular carregamento de dados
  useEffect(() => {
    // Aqui você faria uma chamada à API para buscar a empresa atribuída ao consultor
    // e suas faturas
    setTimeout(() => {
      // Dados simulados
      const mockCompany: Company = {
        id: '1',
        corporateName: 'Empresa ABC Ltda',
        tradeName: 'ABC Telecom',
        cnpj: '12.345.678/0001-90',
        address: 'Av. Paulista, 1000, São Paulo - SP',
        phone: '(11) 3456-7890',
        email: 'contato@abctelecom.com.br',
        active: true
      };

      const mockInvoices: Invoice[] = [
        {
          id: '1',
          companyId: '1',
          month: 'Janeiro',
          year: 2025,
          dueDate: '2025-01-10',
          amount: 1250.75,
          status: 'paid',
          pdfUrl: '/invoices/1.pdf',
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z'
        },
        {
          id: '2',
          companyId: '1',
          month: 'Fevereiro',
          year: 2025,
          dueDate: '2025-02-10',
          amount: 1320.50,
          status: 'paid',
          pdfUrl: '/invoices/2.pdf',
          createdAt: '2025-02-01T10:00:00Z',
          updatedAt: '2025-02-01T10:00:00Z'
        },
        {
          id: '3',
          companyId: '1',
          month: 'Março',
          year: 2025,
          dueDate: '2025-03-10',
          amount: 1275.30,
          status: 'pending',
          pdfUrl: '/invoices/3.pdf',
          createdAt: '2025-03-01T10:00:00Z',
          updatedAt: '2025-03-01T10:00:00Z'
        },
        {
          id: '4',
          companyId: '1',
          month: 'Abril',
          year: 2025,
          dueDate: '2025-04-10',
          amount: 1290.15,
          status: 'pending',
          pdfUrl: '/invoices/4.pdf',
          createdAt: '2025-04-01T10:00:00Z',
          updatedAt: '2025-04-01T10:00:00Z'
        },
        {
          id: '5',
          companyId: '1',
          month: 'Maio',
          year: 2025,
          dueDate: '2025-05-10',
          amount: 1310.25,
          status: 'overdue',
          pdfUrl: '/invoices/5.pdf',
          createdAt: '2025-05-01T10:00:00Z',
          updatedAt: '2025-05-01T10:00:00Z'
        }
      ];

      // Calcular estatísticas
      const totalInvoices = mockInvoices.length;
      const pendingInvoices = mockInvoices.filter(inv => inv.status === 'pending').length;
      const paidInvoices = mockInvoices.filter(inv => inv.status === 'paid').length;
      const overdueInvoices = mockInvoices.filter(inv => inv.status === 'overdue').length;
      const totalAmount = mockInvoices.reduce((sum, inv) => sum + inv.amount, 0);

      setCompany(mockCompany);
      setInvoices(mockInvoices);
      setStats({
        totalInvoices,
        pendingInvoices,
        paidInvoices,
        overdueInvoices,
        totalAmount
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleUploadDialogOpen = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false);
  };

  const handleUploadFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm(prev => ({
        ...prev,
        file: e.target.files![0]
      }));
    }
  };

  const handleUploadSubmit = () => {
    setUploadLoading(true);
    
    // Simulação de upload
    setTimeout(() => {
      // Aqui você faria a chamada à API para fazer o upload da fatura
      
      // Adicionar a nova fatura à lista (simulação)
      const newInvoice: Invoice = {
        id: (invoices.length + 1).toString(),
        companyId: company?.id || '1',
        month: uploadForm.month,
        year: uploadForm.year,
        dueDate: uploadForm.dueDate,
        amount: uploadForm.amount,
        status: 'pending',
        pdfUrl: '/invoices/new.pdf',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setInvoices(prev => [...prev, newInvoice]);
      
      // Atualizar estatísticas
      setStats(prev => ({
        ...prev,
        totalInvoices: prev.totalInvoices + 1,
        pendingInvoices: prev.pendingInvoices + 1,
        totalAmount: prev.totalAmount + uploadForm.amount
      }));
      
      // Resetar formulário
      setUploadForm({
        month: '',
        year: new Date().getFullYear(),
        dueDate: '',
        amount: 0,
        file: null
      });
      
      setUploadLoading(false);
      setUploadDialogOpen(false);
    }, 1500);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
      case 'paid':
        return '#2e7d32'; // Verde
      case 'pending':
        return '#ed6c02'; // Laranja
      case 'overdue':
        return '#d32f2f'; // Vermelho
      default:
        return '#757575'; // Cinza
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paga';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Vencida';
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Área do Consultor
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<DashboardIcon />} label="Dashboard" />
          <Tab icon={<BusinessIcon />} label="Empresa" />
          <Tab icon={<ReceiptIcon />} label="Faturas" />
        </Tabs>

        {/* Dashboard */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Resumo
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Total de Faturas
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
                      {stats.totalInvoices}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#e8f5e9', height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Faturas Pagas
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 600, color: '#2e7d32' }}>
                      {stats.paidInvoices}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Faturas Pendentes
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 600, color: '#ed6c02' }}>
                      {stats.pendingInvoices}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#ffebee', height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Faturas Vencidas
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 600, color: '#d32f2f' }}>
                      {stats.overdueInvoices}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Valor Total das Faturas
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
                      {formatCurrency(stats.totalAmount)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Empresa */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Detalhes da Empresa
            </Typography>
            
            {company && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">
                        Razão Social
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {company.corporateName}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="textSecondary">
                        Nome Fantasia
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {company.tradeName || '-'}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="textSecondary">
                        CNPJ
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {company.cnpj}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">
                        Endereço
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {company.address || '-'}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="textSecondary">
                        Telefone
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {company.phone || '-'}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="textSecondary">
                        E-mail
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {company.email || '-'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        )}

        {/* Faturas */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Faturas da Empresa
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUploadIcon />}
                onClick={handleUploadDialogOpen}
              >
                Nova Fatura
              </Button>
            </Box>
            
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid rgba(0, 0, 0, 0.12)' }}>
              <Table>
                <TableHead sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>
                  <TableRow>
                    <TableCell>Mês/Ano</TableCell>
                    <TableCell>Vencimento</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.month}/{invoice.year}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: `${getStatusColor(invoice.status)}20`,
                            color: getStatusColor(invoice.status),
                            fontWeight: 500
                          }}
                        >
                          {getStatusText(invoice.status)}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Visualizar">
                          <IconButton size="small" sx={{ mr: 1 }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Download">
                          <IconButton size="small" sx={{ mr: 1 }}>
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {invoice.status === 'pending' && (
                          <Tooltip title="Excluir">
                            <IconButton size="small" color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {invoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="textSecondary">
                          Nenhuma fatura encontrada
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* Modal de Upload de Fatura */}
      <Dialog open={uploadDialogOpen} onClose={handleUploadDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Fatura</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mês"
                  name="month"
                  value={uploadForm.month}
                  onChange={handleUploadFormChange}
                  placeholder="Ex: Janeiro"
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ano"
                  name="year"
                  type="number"
                  value={uploadForm.year}
                  onChange={handleUploadFormChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Data de Vencimento"
                  name="dueDate"
                  type="date"
                  value={uploadForm.dueDate}
                  onChange={handleUploadFormChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Valor (R$)"
                  name="amount"
                  type="number"
                  value={uploadForm.amount}
                  onChange={handleUploadFormChange}
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  {uploadForm.file ? uploadForm.file.name : 'Selecionar arquivo PDF'}
                  <input
                    type="file"
                    accept=".pdf"
                    hidden
                    onChange={handleFileChange}
                  />
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadDialogClose} disabled={uploadLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleUploadSubmit}
            variant="contained"
            color="primary"
            disabled={uploadLoading || !uploadForm.month || !uploadForm.dueDate || uploadForm.amount <= 0 || !uploadForm.file}
          >
            {uploadLoading ? <CircularProgress size={24} /> : 'Enviar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsultantPage;

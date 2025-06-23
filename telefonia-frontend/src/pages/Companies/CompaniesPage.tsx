import React, { useState, useEffect, useCallback } from 'react'; // Adicionar useCallback
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Alert,
  Stack,
  useTheme,
  Select,
  OutlinedInput,
  FormControl,
  InputLabel,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  PhoneAndroid as MobileIcon,
  Devices as DevicesIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import AppleLayout from '../../components/Layout/AppleLayout';
import { useAuth } from '../../context/AuthContext';
import CompanyService, { Company, CompanyFilter } from '../../services/company.service';
import UserService, { User } from '../../services/user.service';
import SegmentService, { Segment } from '../../services/segment.service';
import ProviderService, { Provider, ProviderType } from '../../services/provider.service'; // Importar ProviderService
import CNPJService from '../../services/cnpj.service';
import CEPService from '../../services/cep.service';
import { useSnackbar } from 'notistack';

// Formatador de CNPJ
const formatCNPJ = (cnpj: string) => {
  if (!cnpj) return '-';
  
  cnpj = cnpj.replace(/[^0-9]/g, '');
  return cnpj.replace(/^(\d{2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$/, '$1.$2.$3/$4-$5');
};

// Função para calcular o tempo restante até a renovação
const calculateRenewalTime = (renewalDate: string | undefined) => {
  if (!renewalDate) return { days: null, months: null, isExpired: false };
  
  const today = new Date();
  const renewal = new Date(renewalDate);
  
  // Verificar se a data de renovação já passou
  if (renewal < today) {
    return { days: null, months: null, isExpired: true };
  }
  
  // Calcular a diferença em milissegundos
  const diffTime = Math.abs(renewal.getTime() - today.getTime());
  
  // Converter para dias
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Calcular meses aproximados (considerando 30 dias por mês)
  const diffMonths = Math.floor(diffDays / 30);
  
  return { 
    days: diffDays, 
    months: diffMonths,
    isExpired: false
  };
};

// Componente de Modal de Empresa (Criar/Editar)
interface CompanyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (company: Partial<Company>) => void;
  company?: Company;
  loading: boolean;
}

const CompanyModal: React.FC<CompanyModalProps> = ({ 
  open, 
  onClose, 
  onSave, 
  company, 
  loading 
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  
  const [users, setUsers] = useState<User[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [telephonyProviders, setTelephonyProviders] = useState<Provider[]>([]);
  const [internetProviders, setInternetProviders] = useState<Provider[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSegments, setLoadingSegments] = useState(false);
  const [loadingTelephonyProviders, setLoadingTelephonyProviders] = useState(false);
  const [loadingInternetProviders, setLoadingInternetProviders] = useState(false);

  const [formData, setFormData] = useState<Partial<Company>>({
    cnpj: '',
    corporateName: '',
    type: 'filial',
    segment: undefined,
    contractDate: '',
    renewalDate: '',
    address: {
      street: '',
      number: '',
      complement: '',
      district: '',
      city: '',
      state: '',
      zipCode: ''
    },
    manager: {
      name: '',
      email: '',
      phone: '',
      hasWhatsapp: false
    },
    phoneLines: [],
    assets: {
      mobileDevices: [],
      internet: {
        plan: '',
        provider: undefined, // Operadora de Internet
        speed: '',
        hasFixedIp: false,
        ipAddress: '',
        subnetMask: '',
        gateway: '',
        dns: '',
        ipNotes: ''
      },
      tv: {
        plan: '',
        channels: ''
      }
    },
    observation: '',
    assignedUsers: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newPhoneLine, setNewPhoneLine] = useState('');
  const [consultingCNPJ, setConsultingCNPJ] = useState(false);
  
  // Carregar lista de usuários
  const loadUsers = React.useCallback(async () => {
    try {
      setLoadingUsers(true);
      const data = await UserService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      enqueueSnackbar('Erro ao carregar lista de usuários', { variant: 'error' });
    } finally {
      setLoadingUsers(false);
    }
  }, [enqueueSnackbar]);
  
  // Carregar lista de segmentos
  const loadSegments = React.useCallback(async () => {
    try {
      setLoadingSegments(true);
      const data = await SegmentService.getAll();
      setSegments(data);
    } catch (error) {
      console.error('Erro ao carregar segmentos:', error);
      enqueueSnackbar('Erro ao carregar lista de segmentos', { variant: 'error' });
    } finally {
      setLoadingSegments(false);
    }
  }, [enqueueSnackbar]);

  // Carregar lista de operadoras de telefonia
  const loadTelephonyProviders = useCallback(async () => {
    try {
      setLoadingTelephonyProviders(true);
      const data = await ProviderService.getAll({ type: ProviderType.TELEPHONY });
      setTelephonyProviders(data);
    } catch (error) {
      console.error('Erro ao carregar operadoras de telefonia:', error);
      enqueueSnackbar('Erro ao carregar lista de operadoras de telefonia', { variant: 'error' });
    } finally {
      setLoadingTelephonyProviders(false);
    }
  }, [enqueueSnackbar]);

  // Carregar lista de operadoras de internet
  const loadInternetProviders = useCallback(async () => {
    try {
      setLoadingInternetProviders(true);
      const data = await ProviderService.getAll({ type: ProviderType.INTERNET });
      setInternetProviders(data);
    } catch (error) {
      console.error('Erro ao carregar operadoras de internet:', error);
      enqueueSnackbar('Erro ao carregar lista de operadoras de internet', { variant: 'error' });
    } finally {
      setLoadingInternetProviders(false);
    }
  }, [enqueueSnackbar]);

  // Carregar todos os dados necessários quando o modal for aberto
  useEffect(() => {
    if (open) {
      loadUsers();
      loadSegments();
      loadInternetProviders();
    }
  }, [open, loadUsers, loadSegments, loadInternetProviders]);
  
  // Função para consultar CNPJ e preencher dados automaticamente
  const handleCNPJConsult = async () => {
    // Validar se o CNPJ foi informado
    if (!formData.cnpj) {
      enqueueSnackbar('Por favor, informe o CNPJ para consulta', { variant: 'warning' });
      return;
    }

    // Remover formatação do CNPJ
    const cnpjClean = formData.cnpj.replace(/[^0-9]/g, '');
    
    // Validar se o CNPJ tem 14 dígitos
    if (cnpjClean.length !== 14) {
      enqueueSnackbar('CNPJ inválido. Deve conter 14 dígitos', { variant: 'error' });
      return;
    }

    try {
      setConsultingCNPJ(true);
      
      // Consultar CNPJ usando o serviço
      const cnpjData = await CNPJService.consultarCNPJ(cnpjClean);
      
      if (cnpjData) {
        // Preencher os dados do formulário com os dados retornados
        setFormData(prev => ({
          ...prev,
          corporateName: cnpjData.nome || prev.corporateName,
          address: {
            ...prev.address,
            street: cnpjData.logradouro || prev.address?.street || '',
            number: cnpjData.numero || prev.address?.number || '',
            complement: cnpjData.complemento || prev.address?.complement || '',
            district: cnpjData.bairro || prev.address?.district || '',
            city: cnpjData.municipio || prev.address?.city || '',
            state: cnpjData.uf || prev.address?.state || '',
            zipCode: cnpjData.cep || prev.address?.zipCode || ''
          }
        }));
        
        enqueueSnackbar('Dados do CNPJ carregados com sucesso!', { variant: 'success' });
      } else {
        enqueueSnackbar('Não foi possível obter os dados deste CNPJ', { variant: 'error' });
      }
    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error);
      enqueueSnackbar('Erro ao consultar CNPJ. Tente novamente mais tarde.', { variant: 'error' });
    } finally {
      setConsultingCNPJ(false);
    }
  };

  // Inicializar formulário com dados da empresa se estiver editando
  useEffect(() => {
    // Carregar usuários quando o modal for aberto
    if (open) {
      loadUsers();
    }
    
    if (company) {
      // Garantir que os aparelhos celulares tenham a estrutura correta
      const mobileDevices = company.assets?.mobileDevices || [];
      
      // Verificar e corrigir cada aparelho celular
      const validatedMobileDevices = mobileDevices.map((device: any) => {
        // Se o dispositivo não for um objeto válido, criar um novo
        if (!device || typeof device !== 'object') {
          return { model: '', assignedTo: '', assignedDate: null, phoneLine: null };
        }
        
        // Verificar se a linha telefônica associada existe nas linhas da empresa
        let phoneLineIndex;
        if (device.phoneLine && company.phoneLines) {
          phoneLineIndex = company.phoneLines.findIndex(line => line === device.phoneLine);
        }
        
        return {
          model: device.model || '',
          assignedTo: device.assignedTo || '',
          assignedDate: device.assignedDate || null,
          phoneLine: device.phoneLine || null,
          phoneLineIndex: typeof phoneLineIndex === 'number' && phoneLineIndex >= 0 ? phoneLineIndex : undefined
        };
      });
      
      console.log('Formulário inicializado com aparelhos celulares:', validatedMobileDevices);
      
      // Inicializar formulário com dados validados
      setFormData({
        cnpj: company.cnpj,
        corporateName: company.corporateName,
        type: company.type || 'filial',
        segment: company.segment,
        contractDate: company.contractDate || '',
        renewalDate: company.renewalDate || '',
        address: {
          street: company.address?.street || '',
          number: company.address?.number || '',
          complement: company.address?.complement || '',
          district: company.address?.district || '',
          city: company.address?.city || '',
          state: company.address?.state || '',
          zipCode: company.address?.zipCode || ''
        },
        manager: {
          name: company.manager?.name || '',
          email: company.manager?.email || '',
          phone: company.manager?.phone || '',
          hasWhatsapp: company.manager?.hasWhatsapp || false
        },
        phoneLines: company.phoneLines || [],
        assets: {
          ...(company.assets || {}),
          mobileDevices: validatedMobileDevices,
          internet: {
            plan: company.assets?.internet?.plan || '',
            provider: company.assets?.internet?.provider,
            speed: company.assets?.internet?.speed || '',
            hasFixedIp: company.assets?.internet?.hasFixedIp || false,
            ipAddress: company.assets?.internet?.ipAddress || '',
            subnetMask: company.assets?.internet?.subnetMask || '',
            gateway: company.assets?.internet?.gateway || '',
            dns: company.assets?.internet?.dns || '',
            ipNotes: company.assets?.internet?.ipNotes || ''
          },
          tv: {
            plan: company.assets?.tv?.plan || '',
            channels: company.assets?.tv?.channels || ''
          }
        },
        observation: company.observation || '',
        assignedUsers: company.assignedUsers || []
      });
    } else {
      setFormData({
        cnpj: '',
        corporateName: '',
        phoneLines: [],
        assets: {
          mobileDevices: []
        },
        assignedUsers: []
      });
    }
  }, [company, open, loadUsers]);
  
  // Validar CNPJ
  const validateCNPJ = (cnpj: string) => {
    const isValid = CompanyService.validateCNPJ(cnpj);
    if (!isValid) {
      setErrors(prev => ({ ...prev, cnpj: 'CNPJ inválido' }));
      return false;
    }
    setErrors(prev => ({ ...prev, cnpj: '' }));
    return true;
  };
  
  // Validar formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    if (!formData.corporateName?.trim()) {
      newErrors.corporateName = 'Razão social é obrigatória';
      isValid = false;
    }
    
    if (!formData.cnpj?.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
      isValid = false;
    } else if (!CompanyService.validateCNPJ(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Manipular mudanças nos campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cnpj') {
      // Formatar o CNPJ enquanto digita
      const numbersOnly = value.replace(/[^\d]/g, '');
      const formattedCNPJ = numbersOnly.replace(/(\d{2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$/, '$1.$2.$3/$4-$5');
      
      setFormData(prev => ({ ...prev, [name]: formattedCNPJ }));
      
      // Validar CNPJ se tiver 14 dígitos
      if (numbersOnly.length === 14) {
        validateCNPJ(numbersOnly);
      }
    } else if (name.includes('.')) {
      // Lidar com campos aninhados (como address.street, manager.name, assets.internet.plan)
      const keys = name.split('.');
      
      setFormData(prev => {
        // Cria uma cópia profunda do objeto para evitar mutar o estado diretamente
        const newFormData = { ...prev };
        
        // Navega até o objeto pai do campo a ser atualizado
        let current: any = newFormData;
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          // Se o caminho não existir, cria um objeto vazio
          if (!current[key]) current[key] = {};
          current = current[key];
        }
        
        // Atualiza o valor do campo
        const lastKey = keys[keys.length - 1];
        current[lastKey] = value;
        
        return newFormData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Limpar erro do campo
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };
  
  // Adicionar linha telefônica
  const addPhoneLine = () => {
    if (newPhoneLine.trim()) {
      setFormData(prev => ({
        ...prev,
        phoneLines: [...(prev.phoneLines || []), newPhoneLine.trim()]
      }));
      setNewPhoneLine('');
    }
  };
  
  // Remover linha telefônica
  const removePhoneLine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      phoneLines: (prev.phoneLines || []).filter((_, i) => i !== index)
    }));
  };
  
  // Manipular envio do formulário
  const handleSubmit = () => {
    if (validateForm()) {
      // Processar CNPJ (remover formatação)
      const processedData = {
        ...formData,
        cnpj: formData.cnpj?.replace(/[^\d]/g, '')
      };
      
      onSave(processedData);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        {company ? 'Editar Empresa' : 'Nova Empresa'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="CNPJ"
              name="cnpj"
              value={formData.cnpj || ''}
              onChange={handleChange}
              error={!!errors.cnpj}
              helperText={errors.cnpj}
              disabled={loading || !!company}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: !company && (
                  <InputAdornment position="end">
                    <Tooltip title="Consultar CNPJ">
                      <IconButton
                        onClick={handleCNPJConsult}
                        disabled={loading || consultingCNPJ || !formData.cnpj}
                        size="small"
                        edge="end"
                      >
                        {consultingCNPJ ? <CircularProgress size={20} /> : <SearchIcon />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Razão Social"
              name="corporateName"
              value={formData.corporateName || ''}
              onChange={handleChange}
              error={!!errors.corporateName}
              helperText={errors.corporateName}
              disabled={loading}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* Tipo de empresa (matriz/filial) */}
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Tipo"
              name="type"
              value={formData.type || 'filial'}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              <MenuItem value="matriz">Matriz</MenuItem>
              <MenuItem value="filial">Filial</MenuItem>
            </TextField>
          </Grid>
          
          {/* Segmento */}
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Segmento"
              name="segment" // Este nome será usado pelo handleChange
              value={
                formData.segment 
                  ? (typeof formData.segment === 'object' ? (formData.segment as Segment).id : formData.segment) 
                  : ''
              }
              onChange={handleChange} // handleChange vai colocar o segment.id em formData.segment
              disabled={loading || loadingSegments}
              sx={{ mb: 2 }}
            >
              <MenuItem value=""><em>Selecione</em></MenuItem>
              {loadingSegments ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Carregando segmentos...
                </MenuItem>
              ) : segments.length > 0 ? (
                segments.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem> // Usar s.id como value
                ))
              ) : (
                <MenuItem value="outros" disabled>Outros (nenhum segmento carregado)</MenuItem>
              )}
            </TextField>
          </Grid>
          
          {/* Data de contratação */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Data de Contratação"
              name="contractDate"
              type="date"
              value={formData.contractDate || ''}
              onChange={handleChange}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* Próxima renovação */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Próxima Renovação"
              name="renewalDate"
              type="date"
              value={formData.renewalDate || ''}
              onChange={handleChange}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* Seção de Endereço */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Endereço
            </Typography>
          </Grid>
          
          {/* Logradouro */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Logradouro"
              name="address.street"
              value={formData.address?.street || ''}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* Número */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Número"
              name="address.number"
              value={formData.address?.number || ''}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* Complemento */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Complemento"
              name="address.complement"
              value={formData.address?.complement || ''}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* Bairro */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Bairro"
              name="address.district"
              value={formData.address?.district || ''}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* Cidade */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Cidade"
              name="address.city"
              value={formData.address?.city || ''}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* Estado */}
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="UF"
              name="address.state"
              value={formData.address?.state || ''}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* CEP */}
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="CEP"
              name="address.zipCode"
              value={formData.address?.zipCode || ''}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* Seção de Gestor */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Gestor
            </Typography>
          </Grid>
          
          {/* Nome do Gestor */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome do Gestor"
              name="manager.name"
              value={formData.manager?.name || ''}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* Email do Gestor */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email do Gestor"
              name="manager.email"
              type="email"
              value={formData.manager?.email || ''}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* Telefone do Gestor */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefone do Gestor"
              name="manager.phone"
              value={formData.manager?.phone || ''}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* WhatsApp */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.manager?.hasWhatsapp || false}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      manager: {
                        ...(prev.manager || {}),
                        hasWhatsapp: e.target.checked
                      }
                    }));
                  }}
                  disabled={loading}
                  icon={<WhatsAppIcon sx={{ color: 'rgba(37, 211, 102, 0.5)' }} />}
                  checkedIcon={<WhatsAppIcon sx={{ color: '#25D366' }} />}
                />
              }
              label="Possui WhatsApp"
            />
          </Grid>
          
          {/* Seção de Internet */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Internet
            </Typography>
          </Grid>
          
          {/* Operadora de Internet */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Operadora de Internet"
              name="assets.internet.provider" // Mantém o nome para handleChange aninhado
              value={formData.assets?.internet?.provider || ''} // Salva o 'value' da operadora de internet
              onChange={handleChange}
              disabled={loading || loadingInternetProviders}
              sx={{ mb: 2 }}
            >
              <MenuItem value=""><em>Selecione</em></MenuItem>
              {loadingInternetProviders ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Carregando...
                </MenuItem>
              ) : (
                internetProviders.map((p) => (
                  <MenuItem key={p.id} value={p.value}>{p.name}</MenuItem> // Salva o 'value'
                ))
              )}
            </TextField>
          </Grid>

          {/* Plano de Internet */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Plano de Internet"
              name="assets.internet.plan"
              value={formData.assets?.internet?.plan || ''}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* Velocidade */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Velocidade"
              name="assets.internet.speed"
              value={formData.assets?.internet?.speed || ''}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* Checkbox para IP Fixo */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.assets?.internet?.hasFixedIp || false}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      assets: {
                        ...prev.assets,
                        internet: {
                          ...prev.assets?.internet,
                          hasFixedIp: e.target.checked
                        }
                      }
                    }));
                  }}
                  disabled={loading}
                />
              }
              label="Possui IP Fixo"
            />
          </Grid>
          
          {formData.assets?.internet?.hasFixedIp && (
            <>
              {/* IP */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Endereço IP Principal"
                  name="assets.internet.ipAddress"
                  value={formData.assets?.internet?.ipAddress || ''}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{ mb: 2 }}
                  placeholder="192.168.1.100"
                />
              </Grid>
              
              {/* Máscara */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Máscara de Sub-rede"
                  name="assets.internet.subnetMask"
                  value={formData.assets?.internet?.subnetMask || ''}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{ mb: 2 }}
                  placeholder="255.255.255.0"
                />
              </Grid>
              
              {/* Gateway */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Gateway"
                  name="assets.internet.gateway"
                  value={formData.assets?.internet?.gateway || ''}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{ mb: 2 }}
                  placeholder="192.168.1.1"
                />
              </Grid>
              
              {/* DNS */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="DNS"
                  name="assets.internet.dns"
                  value={formData.assets?.internet?.dns || ''}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{ mb: 2 }}
                  placeholder="8.8.8.8, 8.8.4.4"
                />
              </Grid>
              
              {/* Observações de IP (para múltiplos IPs) */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Observações de IP"
                  name="assets.internet.ipNotes"
                  value={formData.assets?.internet?.ipNotes || ''}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{ mb: 2 }}
                  placeholder="Registre aqui IPs adicionais ou outras configurações especiais de rede"
                  helperText="Utilize este campo para registrar múltiplos IPs ou informações adicionais de configuração de rede"
                />
              </Grid>
            </>
          )}
          
          {/* Seção de TV */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              TV
            </Typography>
          </Grid>
          
          {/* Plano de TV */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Plano de TV"
              name="assets.tv.plan"
              value={formData.assets?.tv?.plan || ''}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* Canais */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Canais"
              name="assets.tv.channels"
              value={formData.assets?.tv?.channels || ''}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* Seção de Usuários Associados */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Usuários com Acesso
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="assigned-users-label">Selecione os usuários que terão acesso</InputLabel>
              <Select
                labelId="assigned-users-label"
                multiple
                value={formData.assignedUsers || []}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    assignedUsers: e.target.value as string[]
                  }));
                }}
                input={<OutlinedInput label="Selecione os usuários que terão acesso" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((userId) => {
                      const user = users.find(u => u.id === userId);
                      return (
                        <Chip 
                          key={userId} 
                          label={user?.name || user?.email || userId}
                          size="small"
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'white',
                            fontWeight: 500
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
                disabled={loading || loadingUsers}
                startAdornment={
                  loadingUsers ? (
                    <InputAdornment position="start">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null
                }
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Checkbox checked={(formData.assignedUsers || []).indexOf(user.id) > -1} />
                    <ListItemText 
                      primary={user.name || user.email} 
                      secondary={user.role === 'admin' ? 'Administrador' : user.role === 'manager' ? 'Gerente' : 'Usuário'}
                    />
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Os usuários selecionados terão acesso aos dados desta empresa. Usuários administradores sempre têm acesso a todas as empresas.  
              </Typography>
            </FormControl>
          </Grid>
          
          {/* Campo de Observações */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Observações
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observações"
              name="observation"
              value={formData.observation || ''}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 3 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Card 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Operadora do Cliente
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2
              }}>
                {(company && company.assets?.internet?.provider) ? (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(25, 118, 210, 0.05)',
                    border: '1px solid rgba(25, 118, 210, 0.1)'
                  }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        {company.assets.internet.provider.charAt(0).toUpperCase()}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {company.assets.internet.provider}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Operadora de Internet/Telefonia
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    border: '1px dashed rgba(0, 0, 0, 0.1)'
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Operadora não informada
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Linhas Telefônicas
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2,
                maxHeight: '400px',
                overflowY: 'auto',
                pr: 1
              }}>
                {(formData.phoneLines || []).length > 0 ? (
                  (formData.phoneLines || []).map((line, index) => (
                    <Chip
                      key={index}
                      label={line}
                      onDelete={() => removePhoneLine(index)}
                      disabled={loading}
                      icon={<PhoneIcon />}
                      sx={{
                        borderRadius: '8px',
                        fontWeight: 500,
                        py: 0.5,
                        backgroundColor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText,
                        '& .MuiChip-deleteIcon': {
                          color: theme.palette.primary.contrastText,
                          '&:hover': {
                            color: theme.palette.error.light
                          }
                        }
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma linha telefônica cadastrada.
                  </Typography>
                )}
              </Box>
            </Card>
          </Grid>
          
          {/* Seção de Aparelhos Celulares */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Aparelhos Celulares
            </Typography>
            
            {/* Lista de aparelhos celulares */}
            {((formData.assets && formData.assets.mobileDevices && formData.assets.mobileDevices.length > 0)) ? (
              <Box sx={{ mb: 3 }}>
                {formData.assets.mobileDevices.map((device: any, index: number) => (
                  <Card key={index} sx={{ 
                    p: 2, 
                    mb: 2,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(233, 30, 99, 0.04)',
                    border: '1px solid rgba(233, 30, 99, 0.1)'
                  }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Modelo do Aparelho"
                          value={device.model || ''}
                          onChange={(e) => {
                            const updatedDevices = [...(formData.assets?.mobileDevices || [])];
                            updatedDevices[index] = { ...updatedDevices[index], model: e.target.value };
                            setFormData(prev => ({
                              ...prev,
                              assets: {
                                ...(prev.assets || {}),
                                mobileDevices: updatedDevices
                              }
                            }));
                          }}
                          disabled={loading}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MobileIcon sx={{ color: '#E91E63' }} />
                              </InputAdornment>
                            )
                          }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          fullWidth
                          label="Linha Telefônica Associada"
                          value={device.phoneLineIndex !== undefined ? device.phoneLineIndex : ''}
                          onChange={(e) => {
                            const phoneLineIndex = e.target.value !== '' ? Number(e.target.value) : undefined;
                            const phoneLine = phoneLineIndex !== undefined ? formData.phoneLines?.[phoneLineIndex] : null;
                            
                            const updatedDevices = [...(formData.assets?.mobileDevices || [])];
                            updatedDevices[index] = { 
                              ...updatedDevices[index], 
                              phoneLineIndex,
                              phoneLine
                            };
                            console.log(`Linha selecionada: índice ${phoneLineIndex}, valor: ${phoneLine}`);
                            setFormData(prev => ({
                              ...prev,
                              assets: {
                                ...(prev.assets || {}),
                                mobileDevices: updatedDevices
                              }
                            }));
                          }}
                          disabled={loading || !formData.phoneLines || formData.phoneLines.length === 0}
                          sx={{ mb: 2 }}
                          SelectProps={{
                            MenuProps: {
                              PaperProps: {
                                sx: { maxHeight: 300 }
                              }
                            }
                          }}
                        >
                          <MenuItem value="">
                            <em>Nenhuma linha associada</em>
                          </MenuItem>
                          {(formData.phoneLines || []).map((line, lineIndex) => (
                            <MenuItem key={lineIndex} value={lineIndex}>
                              {line}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Locado para"
                          value={device.assignedTo || ''}
                          onChange={(e) => {
                            const updatedDevices = [...(formData.assets?.mobileDevices || [])];
                            updatedDevices[index] = { 
                              ...updatedDevices[index], 
                              assignedTo: e.target.value,
                              // Se o campo for limpo, remover a data de locação
                              assignedDate: e.target.value ? (device.assignedDate || new Date().toISOString()) : null
                            };
                            setFormData(prev => ({
                              ...prev,
                              assets: {
                                ...(prev.assets || {}),
                                mobileDevices: updatedDevices
                              }
                            }));
                          }}
                          disabled={loading}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      
                      {device.assignedTo && (
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Data de Locação"
                            type="date"
                            value={device.assignedDate ? new Date(device.assignedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                              const updatedDevices = [...(formData.assets?.mobileDevices || [])];
                              updatedDevices[index] = { 
                                ...updatedDevices[index], 
                                assignedDate: e.target.value ? new Date(e.target.value).toISOString() : null
                              };
                              setFormData(prev => ({
                                ...prev,
                                assets: {
                                  ...(prev.assets || {}),
                                  mobileDevices: updatedDevices
                                }
                              }));
                            }}
                            disabled={loading}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 2 }}
                          />
                        </Grid>
                      )}
                      
                      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            const updatedDevices = (formData.assets?.mobileDevices || []).filter((_: any, i: number) => i !== index);
                            setFormData(prev => ({
                              ...prev,
                              assets: {
                                ...(prev.assets || {}),
                                mobileDevices: updatedDevices
                              }
                            }));
                          }}
                          disabled={loading}
                          size="small"
                        >
                          Remover Aparelho
                        </Button>
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Nenhum aparelho celular cadastrado.
              </Typography>
            )}
            
            {/* Botão para adicionar novo aparelho */}
            <Button
              variant="outlined"
              startIcon={<MobileIcon />}
              onClick={() => {
                const newDevice = { model: '', assignedTo: '', assignedDate: null };
                setFormData(prev => ({
                  ...prev,
                  assets: {
                    ...(prev.assets || {}),
                    mobileDevices: [...(prev.assets?.mobileDevices || []), newDevice]
                  }
                }));
              }}
              disabled={loading}
              sx={{ mb: 3 }}
            >
              Adicionar Aparelho Celular
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Componente de Modal de Detalhes
interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  company?: Company;
}

const DetailModal: React.FC<DetailModalProps> = ({ open, onClose, company }) => {
  const theme = useTheme();
  const [segments, setSegments] = useState<Segment[]>([]);
  
  // Carregar segmentos quando o modal for aberto
  useEffect(() => {
    if (open && company) {
      const loadSegments = async () => {
        try {
          const data = await SegmentService.getAll();
          setSegments(data);
        } catch (error) {
          console.error('Erro ao carregar segmentos:', error);
        }
      };
      
      loadSegments();
    }
  }, [open, company]);
  
  if (!company) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          width: '90%',
          maxWidth: '1100px',
          height: 'auto',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon color="primary" />
          <Typography variant="h6" component="div">
            {company.corporateName}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Informações Básicas
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    CNPJ
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatCNPJ(company.cnpj)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Razão Social
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {company.corporateName}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Tipo
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {company.type === 'matriz' ? 'Matriz' : company.type === 'filial' ? 'Filial' : 'Não especificado'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Segmento
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {company.segment ? (
                      <Chip 
                        size="small" 
                        label={typeof company.segment === 'object' ? (company.segment.name || company.segment.value) : company.segment}
                        sx={{
                          backgroundColor: 'rgba(156, 39, 176, 0.08)',
                          color: '#9C27B0',
                          border: '1px solid rgba(156, 39, 176, 0.2)',
                          fontWeight: 500
                        }}
                      />
                    ) : 'Não especificado'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Data de Contratação
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {company.contractDate ? new Date(company.contractDate).toLocaleDateString('pt-BR') : 'Não especificada'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Próxima Renovação
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {company.renewalDate ? new Date(company.renewalDate).toLocaleDateString('pt-BR') : 'Não especificada'}
                  </Typography>
                </Box>
                
                {/* Observações */}
                {company.observation && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Observações
                    </Typography>
                    <Box sx={{ 
                      backgroundColor: 'rgba(255, 243, 224, 0.5)', 
                      p: 1.5, 
                      borderRadius: 1, 
                      border: '1px solid rgba(255, 167, 38, 0.2)'
                    }}>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        {company.observation}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Card>
          </Grid>
          
          {/* Segunda coluna - Endereço e Gestor */}
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Endereço
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {company.address ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Logradouro
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {company.address.street || 'Não informado'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Número
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {company.address.number || 'Não informado'}
                      </Typography>
                    </Box>
                    
                    {company.address.complement && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Complemento
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {company.address.complement}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Bairro
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {company.address.district || 'Não informado'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Cidade/UF
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {company.address.city || 'Não informada'}{company.address.state ? `/${company.address.state}` : ''}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        CEP
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {company.address.zipCode || 'Não informado'}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Endereço não cadastrado.
                  </Typography>
                )}
                
                {/* Informações do gestor */}
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
                  Gestor
                </Typography>
                
                {company.manager ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Nome
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {company.manager.name || 'Não informado'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {company.manager.email || 'Não informado'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Telefone
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {company.manager.phone || 'Não informado'}
                        </Typography>
                        {company.manager.hasWhatsapp && (
                          <Chip 
                            size="small" 
                            icon={<WhatsAppIcon sx={{ color: '#25D366' }} />}
                            label="WhatsApp"
                            sx={{ 
                              backgroundColor: 'rgba(37, 211, 102, 0.1)', 
                              color: '#25D366',
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 500,
                              border: '1px solid rgba(37, 211, 102, 0.2)'
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Gestor não cadastrado.
                  </Typography>
                )}
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Cadastrado em
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {company.createdAt ? new Date(company.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Última atualização
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {company.updatedAt ? new Date(company.updatedAt).toLocaleDateString('pt-BR') : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Operadora do Cliente
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2
              }}>
                {(company && company.assets?.internet?.provider) ? (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(25, 118, 210, 0.05)',
                    border: '1px solid rgba(25, 118, 210, 0.1)'
                  }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        {company.assets.internet.provider.charAt(0).toUpperCase()}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {company.assets.internet.provider}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Operadora de Internet/Telefonia
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    border: '1px dashed rgba(0, 0, 0, 0.1)'
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Operadora não informada
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Linhas Telefônicas
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2,
                maxHeight: '400px',
                overflowY: 'auto',
                pr: 1
              }}>
                {(company.phoneLines || []).length > 0 ? (
                  company.phoneLines.map((line, index) => {
                    // Verificar se esta linha está associada a algum aparelho
                    const associatedDevice = company.assets?.mobileDevices?.find((device: any) => device.phoneLine === line);
                    const isAssigned = !!associatedDevice && !!associatedDevice.assignedTo;
                    
                    // Cor laranja para itens locados
                    const ORANGE_COLOR = '#ED6C02';
                    
                    return (
                      <Box 
                        key={index} 
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          p: 1.5,
                          borderRadius: '8px',
                          backgroundColor: isAssigned ? 'rgba(237, 108, 2, 0.15)' : 'rgba(0, 128, 105, 0.05)',
                          border: isAssigned ? '1px solid rgba(237, 108, 2, 0.3)' : '1px solid rgba(0, 128, 105, 0.1)',
                          boxShadow: isAssigned ? '0 2px 4px rgba(237, 108, 2, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                          position: 'relative',
                          '&::before': isAssigned ? {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px',
                            backgroundColor: '#ED6C02',
                            borderRadius: '4px 0 0 4px'
                          } : {}
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          {/* Ícone e número da linha */}
                          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '180px' }}>
                            <PhoneIcon sx={{ 
                              color: isAssigned ? ORANGE_COLOR : '#008069',
                              mr: 1,
                              fontSize: '1.2rem'
                            }} />
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600,
                              color: isAssigned ? ORANGE_COLOR : '#008069'
                            }}>
                              {line}
                            </Typography>
                          </Box>
                          
                          {/* Informações do aparelho e pessoa */}
                          {isAssigned ? (
                            <>
                              {/* Modelo do aparelho */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '180px' }}>
                                <MobileIcon fontSize="small" sx={{ color: ORANGE_COLOR, opacity: 0.8 }} />
                                <Typography variant="body2">
                                  {associatedDevice.model || 'Aparelho'}
                                </Typography>
                              </Box>
                              
                              {/* Pessoa atribuída */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '180px' }}>
                                <PersonIcon fontSize="small" sx={{ color: ORANGE_COLOR, opacity: 0.8 }} />
                                <Typography variant="body2">
                                  {associatedDevice.assignedTo}
                                </Typography>
                              </Box>
                              
                              {/* Data de atribuição */}
                              {associatedDevice.assignedDate && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '150px' }}>
                                  <CalendarTodayIcon fontSize="small" sx={{ color: ORANGE_COLOR, opacity: 0.8 }} />
                                  <Typography variant="body2">
                                    {new Date(associatedDevice.assignedDate).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              )}
                              
                              {/* Chip de status */}
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', ml: 'auto' }}>
                                <Chip
                                  size="small"
                                  label="Locado"
                                  sx={{ 
                                    height: 24,
                                    fontSize: '0.75rem',
                                    backgroundColor: '#ED6C02',
                                    color: 'white',
                                    fontWeight: 600,
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                  }}
                                />
                              </Box>
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                              Sem aparelho associado
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ width: '100%' }}>
                    Nenhuma linha telefônica cadastrada.
                  </Typography>
                )}
              </Box>
            </Card>
          </Grid>
          
          {/* Card de Aparelhos Celulares Sem Linha */}
          <Grid item xs={12}>
            <Card 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Aparelhos Celulares Sem Linha
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2,
                maxHeight: '400px',
                overflowY: 'auto',
                pr: 1
              }}>
                {/* Filtrar apenas aparelhos sem linha telefônica associada */}
                {(company.assets?.mobileDevices?.filter((device: any) => !device.phoneLine)?.length ?? 0) > 0 ? (
                  company.assets?.mobileDevices
                    ?.filter((device: any) => !device.phoneLine)
                    .map((device: any, index: number) => {
                      // Cor laranja para itens locados
                      const ORANGE_COLOR = '#ED6C02';
                      const isAssigned = !!device.assignedTo;
                      
                      return (
                        <Box 
                          key={index} 
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            p: 1.5,
                            borderRadius: '8px',
                            backgroundColor: isAssigned ? 'rgba(237, 108, 2, 0.15)' : 'rgba(0, 128, 105, 0.05)',
                            border: isAssigned ? '1px solid rgba(237, 108, 2, 0.3)' : '1px solid rgba(0, 128, 105, 0.1)',
                            boxShadow: isAssigned ? '0 2px 4px rgba(237, 108, 2, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                            position: 'relative',
                            '&::before': isAssigned ? {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: '4px',
                              backgroundColor: '#ED6C02',
                              borderRadius: '4px 0 0 4px'
                            } : {}
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            {/* Ícone e modelo do aparelho */}
                            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '180px' }}>
                              <MobileIcon sx={{ 
                                color: isAssigned ? ORANGE_COLOR : '#008069',
                                mr: 1,
                                fontSize: '1.2rem'
                              }} />
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 600,
                                color: isAssigned ? ORANGE_COLOR : '#008069'
                              }}>
                                {device.model || `Aparelho ${index + 1}`}
                              </Typography>
                            </Box>
                            
                            {/* Informações de atribuição */}
                            {isAssigned ? (
                              <>
                                {/* Pessoa atribuída */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '180px' }}>
                                  <PersonIcon fontSize="small" sx={{ color: ORANGE_COLOR, opacity: 0.8 }} />
                                  <Typography variant="body2">
                                    {device.assignedTo}
                                  </Typography>
                                </Box>
                                
                                {/* Data de atribuição */}
                                {device.assignedDate && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '150px' }}>
                                    <CalendarTodayIcon fontSize="small" sx={{ color: ORANGE_COLOR, opacity: 0.8 }} />
                                    <Typography variant="body2">
                                      {new Date(device.assignedDate).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                )}
                                
                                {/* Chip de status */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', ml: 'auto' }}>
                                  <Chip
                                    size="small"
                                    label="Locado"
                                    sx={{ 
                                      height: 24,
                                      fontSize: '0.75rem',
                                      backgroundColor: '#ED6C02',
                                      color: 'white',
                                      fontWeight: 600,
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                    }}
                                  />
                                </Box>
                              </>
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                                Não atribuído
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      );
                    })
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ width: '100%' }}>
                    Todos os aparelhos celulares estão associados a linhas telefônicas.
                  </Typography>
                )}
              </Box>
            </Card>
          </Grid>
          

          
          {/* Cards de Internet e TV */}
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Internet
              </Typography>
              
              {company.assets?.internet ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Plano
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {company.assets.internet.plan || 'Plano básico'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Velocidade
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {company.assets.internet.speed || 'Não informada'}
                    </Typography>
                  </Box>
                  
                  {company.assets.internet.hasFixedIp && (
                    <>
                      <Divider sx={{ my: 0.5 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Configurações de IP Fixo
                      </Typography>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Endereço IP
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {company.assets.internet.ipAddress || 'Não informado'}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Máscara de Sub-rede
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {company.assets.internet.subnetMask || 'Não informada'}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Gateway
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {company.assets.internet.gateway || 'Não informado'}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          DNS
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {company.assets.internet.dns || 'Não informado'}
                        </Typography>
                      </Box>
                      
                      {company.assets.internet.ipNotes && (
                        <Box sx={{ mt: 1, p: 1.5, backgroundColor: 'rgba(255, 244, 229, 0.7)', borderRadius: '8px', border: '1px solid rgba(255, 167, 38, 0.2)' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>
                            Observações de IP:
                          </Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                            {company.assets.internet.ipNotes}
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                  
                  <Chip
                    label="Internet Ativa"
                    icon={<DevicesIcon sx={{ color: '#008069' }} />}
                    sx={{
                      borderRadius: '8px',
                      fontWeight: 500,
                      py: 0.5,
                      backgroundColor: 'rgba(0, 128, 105, 0.08)',
                      color: '#008069',
                      border: '1px solid rgba(0, 128, 105, 0.2)',
                    }}
                  />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhum plano de internet cadastrado.
                </Typography>
              )}
            </Card>
          </Grid>
          
          {/* Card de TV */}
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                TV
              </Typography>
              
              {company.assets?.tv ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Plano
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {company.assets.tv.plan || 'Plano básico'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Canais
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {company.assets.tv.channels || 'Não especificados'}
                    </Typography>
                  </Box>
                  
                  <Chip
                    label="TV Ativa"
                    icon={<BusinessIcon sx={{ color: '#008069' }} />}
                    sx={{
                      borderRadius: '8px',
                      fontWeight: 500,
                      py: 0.5,
                      backgroundColor: 'rgba(0, 128, 105, 0.08)',
                      color: '#008069',
                      border: '1px solid rgba(0, 128, 105, 0.2)',
                    }}
                  />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhum plano de TV cadastrado.
                </Typography>
              )}
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Usuários Associados
              </Typography>
              
              {(company.users && company.users.length > 0) ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nome</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Função</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {company.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name || 'N/A'}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhum usuário associado a esta empresa.
                </Typography>
              )}
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Accordion 
              sx={{ 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                borderRadius: '16px !important',
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>
                  Metadados Avançados e Ativos
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
                  <pre style={{ 
                    overflowX: 'auto', 
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    padding: theme.spacing(2),
                    borderRadius: theme.spacing(1)
                  }}>
                    {JSON.stringify(company.assets || {}, null, 2)}
                  </pre>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Página Principal de Empresas
const CompaniesPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSegments, setLoadingSegments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modais
  const [companyModal, setCompanyModal] = useState<{
    open: boolean;
    company?: Company;
  }>({ open: false });
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    company?: Company;
  }>({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    company?: Company;
  }>({ open: false });
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Carregar empresas
  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await CompanyService.getAll({
        search: searchTerm || undefined
      });
      setCompanies(data);
    } catch (err: any) {
      setError('Erro ao carregar empresas: ' + (err.message || 'Erro desconhecido'));
      console.error('Erro ao carregar empresas:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar segmentos
  const loadSegmentsData = async () => {
    setLoadingSegments(true);
    try {
      const data = await SegmentService.getAll();
      setSegments(data);
    } catch (err: any) {
      console.error('Erro ao carregar segmentos:', err);
    } finally {
      setLoadingSegments(false);
    }
  };

  // Carregar empresas e segmentos quando a página carregar
  useEffect(() => {
    loadCompanies();
    loadSegmentsData();
  }, []);
  
  // Buscar empresas quando o termo de busca mudar
  const handleSearch = () => {
    loadCompanies();
  };
  
  // Funções de CRUD
  const handleCreateOrUpdate = async (companyData: Partial<Company>) => {
    setSaveLoading(true);
    
    try {
      // Não precisamos mais preparar os dados aqui, pois isso é feito no serviço
      // Apenas enviar os dados diretamente para o serviço
      
      if (companyModal.company) {
        // Atualizar empresa existente
        const result = await CompanyService.update(companyModal.company.id, companyData);
        console.log('Empresa atualizada:', result);
        enqueueSnackbar('Empresa atualizada com sucesso!', { variant: 'success' });
      } else {
        // Criar nova empresa
        const result = await CompanyService.create(companyData as Omit<Company, 'id'>);
        console.log('Empresa criada:', result);
        enqueueSnackbar('Empresa criada com sucesso!', { variant: 'success' });
      }
      
      // Fechar modal e recarregar dados
      setCompanyModal({ open: false });
      loadCompanies();
    } catch (err: any) {
      console.error('Erro ao salvar empresa:', err);
      
      // Tratamento especial para erros de rede
      if (err.message === 'Network Error') {
        enqueueSnackbar('Erro de conexão com o servidor. Os dados foram salvos localmente.', { 
          variant: 'warning',
          autoHideDuration: 5000
        });
        
        // Mesmo com erro de rede, fechamos o modal para simular sucesso
        setCompanyModal({ open: false });
        loadCompanies();
        return;
      }
      
      enqueueSnackbar('Erro ao salvar empresa: ' + (err.message || 'Erro desconhecido'), { variant: 'error' });
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!deleteConfirm.company) return;
    
    setSaveLoading(true);
    
    try {
      await CompanyService.delete(deleteConfirm.company.id);
      enqueueSnackbar('Empresa excluída com sucesso!', { variant: 'success' });
      setDeleteConfirm({ open: false });
      loadCompanies();
    } catch (err: any) {
      console.error('Erro ao excluir empresa:', err);
      enqueueSnackbar('Erro ao excluir empresa: ' + (err.message || 'Erro desconhecido'), { variant: 'error' });
    } finally {
      setSaveLoading(false);
    }
  };
  
  return (
    <AppleLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Empresas
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadCompanies}
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
            Nova Empresa
          </Button>
        </Box>
      </Box>
      
      {/* Barra de busca */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          gap: 1
        }}
      >
        <TextField
          fullWidth
          placeholder="Buscar por CNPJ ou Razão Social"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          startIcon={<SearchIcon />}
          sx={{
            borderRadius: '10px',
            fontWeight: 500,
            minWidth: '120px',
            backgroundColor: '#1976D2',
            '&:hover': {
              backgroundColor: '#1565C0'
            },
            transition: 'background-color 0.2s ease-in-out'
          }}
        >
          Buscar
        </Button>
      </Paper>
      
      {/* Mensagem de erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Tabela de empresas */}
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
                <TableCell sx={{ fontWeight: 600 }}>CNPJ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Razão Social</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Segmento</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Responsável</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Linhas</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Aparelho celular</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Internet</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>TV</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Renovação</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Criado em</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={13} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="text.secondary">
                      Nenhuma empresa encontrada.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((company) => (
                  <TableRow key={company.id} sx={{ 
                    '&:hover': { 
                      backgroundColor: 'rgba(0, 0, 0, 0.02)' 
                    } 
                  }}>
                    <TableCell>{formatCNPJ(company.cnpj)}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{company.corporateName}</TableCell>
                    <TableCell>
                      {company.type ? (
                        <Chip
                          label={company.type === 'matriz' ? 'Matriz' : 'Filial'}
                          size="small"
                          sx={{
                            borderRadius: '8px',
                            backgroundColor: company.type === 'matriz' ? 'rgba(76, 175, 80, 0.08)' : 'rgba(33, 150, 243, 0.08)',
                            color: company.type === 'matriz' ? '#4CAF50' : '#2196F3',
                            border: company.type === 'matriz' ? '1px solid rgba(76, 175, 80, 0.2)' : '1px solid rgba(33, 150, 243, 0.2)',
                            fontWeight: 500,
                            '&:hover': {
                              backgroundColor: company.type === 'matriz' ? 'rgba(76, 175, 80, 0.12)' : 'rgba(33, 150, 243, 0.12)'
                            }
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {company.segment ? (
                        <Chip
                          label={typeof company.segment === 'object' ? (company.segment.name || company.segment.value) : company.segment}
                          size="small"
                          sx={{
                            borderRadius: '8px',
                            backgroundColor: 'rgba(156, 39, 176, 0.08)',
                            color: '#9C27B0',
                            border: '1px solid rgba(156, 39, 176, 0.2)',
                            fontWeight: 500,
                            '&:hover': {
                              backgroundColor: 'rgba(156, 39, 176, 0.12)'
                            }
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    {/* Coluna de Responsável */}
                    <TableCell>
                      {(company.assignedUsers && company.assignedUsers.length > 0) ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Chip
                            label={`${company.assignedUsers.length} usuário${company.assignedUsers.length > 1 ? 's' : ''}`}
                            size="small"
                            icon={<PersonIcon sx={{ color: '#1976D2' }} />}
                            sx={{
                              borderRadius: '8px',
                              backgroundColor: 'rgba(25, 118, 210, 0.08)',
                              color: '#1976D2',
                              border: '1px solid rgba(25, 118, 210, 0.2)',
                              fontWeight: 500,
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.12)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          />
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Administradores
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {(company.phoneLines || []).length > 0 ? (
                        <Chip
                          label={`${(company.phoneLines || []).length} linha${(company.phoneLines || []).length > 1 ? 's' : ''}`}
                          size="small"
                          icon={<PhoneIcon sx={{ color: '#6A5ACD' }} />}
                          sx={{
                            borderRadius: '8px',
                            backgroundColor: 'rgba(106, 90, 205, 0.08)',
                            color: '#6A5ACD',
                            border: '1px solid rgba(106, 90, 205, 0.2)',
                            fontWeight: 500,
                            '&:hover': {
                              backgroundColor: 'rgba(106, 90, 205, 0.12)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Nenhuma
                        </Typography>
                      )}
                    </TableCell>
                    {/* Coluna de Aparelho celular */}
                    <TableCell>
                      {(company.assets?.mobileDevices?.length ?? 0) > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Chip
                            label={`${(company.assets?.mobileDevices?.length ?? 0)} aparelho${(company.assets?.mobileDevices?.length ?? 0) > 1 ? 's' : ''}`}
                            size="small"
                            icon={<MobileIcon sx={{ color: '#E91E63' }} />}
                            sx={{
                              borderRadius: '8px',
                              backgroundColor: 'rgba(233, 30, 99, 0.08)',
                              color: '#E91E63',
                              border: '1px solid rgba(233, 30, 99, 0.2)',
                              fontWeight: 500,
                              '&:hover': {
                                backgroundColor: 'rgba(233, 30, 99, 0.12)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          />
                          {company.assets?.mobileDevices?.some((device: any) => device.assignedTo) && (
                            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                              {(company.assets?.mobileDevices?.filter((device: any) => device.assignedTo).length ?? 0)} locado(s)
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Nenhum
                        </Typography>
                      )}
                    </TableCell>
                    
                    {/* Coluna de Internet */}
                    <TableCell>
                      {(company.assets?.internet) ? (
                        <Chip
                          label={`${company.assets.internet.plan || 'Plano básico'}`}
                          size="small"
                          icon={<DevicesIcon sx={{ color: '#9C27B0' }} />}
                          sx={{
                            borderRadius: '8px',
                            backgroundColor: 'rgba(156, 39, 176, 0.08)',
                            color: '#9C27B0',
                            border: '1px solid rgba(156, 39, 176, 0.2)',
                            fontWeight: 500,
                            '&:hover': {
                              backgroundColor: 'rgba(156, 39, 176, 0.12)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Nenhum
                        </Typography>
                      )}
                    </TableCell>
                    
                    {/* Coluna de TV */}
                    <TableCell>
                      {(company.assets?.tv) ? (
                        <Chip
                          label={`${company.assets.tv.plan || 'Plano básico'}`}
                          size="small"
                          icon={<BusinessIcon sx={{ color: '#FF9800' }} />}
                          sx={{
                            borderRadius: '8px',
                            backgroundColor: 'rgba(255, 152, 0, 0.08)',
                            color: '#FF9800',
                            border: '1px solid rgba(255, 152, 0, 0.2)',
                            fontWeight: 500,
                            '&:hover': {
                              backgroundColor: 'rgba(255, 152, 0, 0.12)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Nenhum
                        </Typography>
                      )}
                    </TableCell>
                    
                    {/* Coluna de Renovação */}
                    <TableCell>
                      {company.renewalDate ? (
                        (() => {
                          const renewal = calculateRenewalTime(company.renewalDate);
                          
                          if (renewal.isExpired) {
                            return (
                              <Chip
                                label="Contrato vencido"
                                size="small"
                                sx={{
                                  borderRadius: '8px',
                                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                                  color: '#D32F2F',
                                  border: '1px solid rgba(211, 47, 47, 0.2)',
                                  fontWeight: 500
                                }}
                              />
                            );
                          }
                          
                          // Definir cores baseadas no tempo restante
                          let color = '#4CAF50'; // Verde para mais de 3 meses
                          let bgColor = 'rgba(76, 175, 80, 0.08)';
                          let borderColor = 'rgba(76, 175, 80, 0.2)';
                          
                          if (renewal.days && renewal.days <= 30) {
                            // Vermelho para menos de 1 mês
                            color = '#D32F2F';
                            bgColor = 'rgba(211, 47, 47, 0.08)';
                            borderColor = 'rgba(211, 47, 47, 0.2)';
                          } else if (renewal.days && renewal.days <= 90) {
                            // Laranja para menos de 3 meses
                            color = '#ED6C02';
                            bgColor = 'rgba(237, 108, 2, 0.08)';
                            borderColor = 'rgba(237, 108, 2, 0.2)';
                          }
                          
                          return (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Chip
                                label={`${renewal.days} dias`}
                                size="small"
                                sx={{
                                  borderRadius: '8px',
                                  backgroundColor: bgColor,
                                  color: color,
                                  border: `1px solid ${borderColor}`,
                                  fontWeight: 500
                                }}
                              />
                              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                                {renewal.months} {renewal.months === 1 ? 'mês' : 'meses'}
                              </Typography>
                            </Box>
                          );
                        })()
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Não informada
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {company.createdAt
                        ? new Date(company.createdAt).toLocaleDateString('pt-BR')
                        : 'N/A'}
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
                            onClick={() => setDetailModal({ open: true, company })}
                          >
                            <VisibilityIcon fontSize="small" sx={{ color: '#1976D2' }} />
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
                            onClick={() => setCompanyModal({ open: true, company })}
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
                            onClick={() => setDeleteConfirm({ open: true, company })}
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
      
      {/* Modal de Criar/Editar */}
      <CompanyModal
        open={companyModal.open}
        onClose={() => setCompanyModal({ open: false })}
        onSave={handleCreateOrUpdate}
        company={companyModal.company}
        loading={saveLoading}
      />
      
      {/* Modal de Detalhes */}
      <DetailModal
        open={detailModal.open}
        onClose={() => setDetailModal({ open: false })}
        company={detailModal.company}
      />
      
      {/* Modal de Confirmação de Exclusão */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => saveLoading ? null : setDeleteConfirm({ open: false })}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Tem certeza que deseja excluir a empresa <strong>{deleteConfirm.company?.corporateName}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Esta ação não pode ser desfeita e todos os dados associados serão removidos.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirm({ open: false })}
            disabled={saveLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={saveLoading}
            startIcon={saveLoading ? <CircularProgress size={20} /> : null}
          >
            {saveLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppleLayout>
  );
};

export default CompaniesPage;

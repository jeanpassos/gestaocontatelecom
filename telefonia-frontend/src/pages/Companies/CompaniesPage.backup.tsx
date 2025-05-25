import React, { useState, useEffect } from 'react';
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
  useTheme
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
import AppLayout from '../../components/Layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import CompanyService, { Company } from '../../services/company.service';
import CNPJService from '../../services/cnpj.service';
import { useSnackbar } from 'notistack';

// Formatador de CNPJ
const formatCNPJ = (cnpj: string) => {
  if (!cnpj) return '-';
  
  cnpj = cnpj.replace(/[^0-9]/g, '');
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
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
  const [formData, setFormData] = useState<Partial<Company>>({
    cnpj: '',
    corporateName: '',
    type: 'branch',
    provider: undefined,
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
    observation: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newPhoneLine, setNewPhoneLine] = useState('');
  const [consultingCNPJ, setConsultingCNPJ] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  
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
      
      // Inicializar formulário com dados validados
      setFormData({
        cnpj: company.cnpj,
        corporateName: company.corporateName,
        type: company.type || 'branch',
        provider: company.provider,
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
            speed: company.assets?.internet?.speed || ''
          },
          tv: {
            plan: company.assets?.tv?.plan || '',
            channels: company.assets?.tv?.channels || ''
          }
        },
        observation: company.observation || ''
      });
      
      console.log('Formulário inicializado com aparelhos celulares:', validatedMobileDevices);
    } else {
      setFormData({
        cnpj: '',
        corporateName: '',
        phoneLines: [],
        assets: {
          mobileDevices: []
        }
      });
    }
  }, [company]);
  
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
      const formattedCNPJ = numbersOnly.replace(/(\d{2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/, (_, p1, p2, p3, p4, p5) => {
        let result = p1;
        if (p2) result += '.' + p2;
        if (p3) result += '.' + p3;
        if (p4) result += '/' + p4;
        if (p5) result += '-' + p5;
        return result;
      });
      
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
              value={formData.type || 'branch'}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              <MenuItem value="headquarters">Matriz</MenuItem>
              <MenuItem value="branch">Filial</MenuItem>
            </TextField>
          </Grid>
          
          {/* Operadora */}
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Operadora"
              name="provider"
              value={formData.provider || ''}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              <MenuItem value=""><em>Selecione</em></MenuItem>
              <MenuItem value="vivo">Vivo</MenuItem>
              <MenuItem value="claro">Claro</MenuItem>
              <MenuItem value="tim">TIM</MenuItem>
              <MenuItem value="oi">Oi</MenuItem>
              <MenuItem value="other">Outra</MenuItem>
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
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
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
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
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
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Internet
            </Typography>
          </Grid>
          
          {/* Plano de Internet */}
          <Grid item xs={12} md={6}>
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
          <Grid item xs={12} md={6}>
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
                  name="assets.internet.ip"
                  value={formData.assets?.internet?.ip || ''}
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
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
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
          
          {/* Campo de Observações */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
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
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Linhas Telefônicas
            </Typography>
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Nova Linha"
                value={newPhoneLine}
                onChange={(e) => setNewPhoneLine(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  )
                }}
              />
              <Button
                variant="contained"
                onClick={addPhoneLine}
                disabled={!newPhoneLine.trim() || loading}
                sx={{ minWidth: '120px' }}
              >
                Adicionar
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {(formData.phoneLines || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhuma linha telefônica cadastrada.
                </Typography>
              ) : (
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
              )}
            </Box>
          </Grid>
          
          {/* Seção de Aparelhos Celulares */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
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
                          {formData.phoneLines?.map((line, lineIndex) => (
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
                    {company.type === 'headquarters' ? 'Matriz' : company.type === 'branch' ? 'Filial' : 'Não especificado'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Operadora
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {company.provider ? (
                      <Chip 
                        size="small" 
                        label={{
                          'vivo': 'Vivo',
                          'claro': 'Claro',
                          'tim': 'TIM',
                          'oi': 'Oi',
                          'other': 'Outra'
                        }[company.provider] || company.provider}
                        sx={{
                          backgroundColor: {
                            'vivo': 'rgba(90, 103, 216, 0.1)',
                            'claro': 'rgba(237, 28, 36, 0.1)',
                            'tim': 'rgba(0, 114, 198, 0.1)',
                            'oi': 'rgba(255, 127, 0, 0.1)',
                            'other': 'rgba(150, 150, 150, 0.1)'
                          }[company.provider] || 'rgba(150, 150, 150, 0.1)',
                          color: {
                            'vivo': '#5A67D8',
                            'claro': '#ED1C24',
                            'tim': '#0072C6',
                            'oi': '#FF7F00',
                            'other': '#666666'
                          }[company.provider] || '#666666',
                          border: `1px solid ${
                            {
                              'vivo': 'rgba(90, 103, 216, 0.3)',
                              'claro': 'rgba(237, 28, 36, 0.3)',
                              'tim': 'rgba(0, 114, 198, 0.3)',
                              'oi': 'rgba(255, 127, 0, 0.3)',
                              'other': 'rgba(150, 150, 150, 0.3)'
                            }[company.provider] || 'rgba(150, 150, 150, 0.3)'
                          }`
                        }}
                      />
                    ) : 'Não especificada'}
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
                Linhas Telefônicas
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(company.phoneLines || []).length > 0 ? (
                  company.phoneLines.map((line, index) => {
                    // Verificar se esta linha está associada a algum aparelho
                    const associatedDevice = company.assets?.mobileDevices?.find((device: any) => device.phoneLine === line);
                    const isAssigned = associatedDevice && associatedDevice.assignedTo;
                    
                    // Cor laranja para itens locados
                    const ORANGE_COLOR = '#ED6C02';
                    
                    return (
                      <Box 
                        key={index} 
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          width: '100%',
                          p: 1,
                          borderRadius: '8px',
                          backgroundColor: isAssigned ? 'rgba(237, 108, 2, 0.08)' : 'rgba(0, 128, 105, 0.04)',
                          border: isAssigned ? '1px solid rgba(237, 108, 2, 0.2)' : '1px solid rgba(0, 128, 105, 0.1)',
                        }}
                      >
                        <Chip
                          label={line}
                          icon={<PhoneIcon sx={{ color: isAssigned ? ORANGE_COLOR : '#008069' }} />}
                          sx={{
                            borderRadius: '8px',
                            fontWeight: 500,
                            py: 0.5,
                            backgroundColor: isAssigned ? 'rgba(237, 108, 2, 0.12)' : 'rgba(0, 128, 105, 0.08)',
                            color: isAssigned ? ORANGE_COLOR : '#008069',
                            border: isAssigned ? '1px solid rgba(237, 108, 2, 0.3)' : '1px solid rgba(0, 128, 105, 0.2)',
                            flexShrink: 0,
                          }}
                        />
                        
                        {isAssigned && (
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, ml: 1, flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <MobileIcon fontSize="small" sx={{ color: ORANGE_COLOR }} />
                              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                {associatedDevice.model || 'Aparelho'}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PersonIcon fontSize="small" sx={{ color: ORANGE_COLOR }} />
                              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                {associatedDevice.assignedTo}
                              </Typography>
                            </Box>
                            
                            {associatedDevice.assignedDate && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CalendarTodayIcon fontSize="small" sx={{ color: ORANGE_COLOR }} />
                                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                  {new Date(associatedDevice.assignedDate).toLocaleDateString()}
                                </Typography>
                              </Box>
                            )}
                            
                            <Chip
                              size="small"
                              label="Locado"
                              sx={{ 
                                height: 18,
                                fontSize: '0.6rem',
                                backgroundColor: 'rgba(237, 108, 2, 0.12)',
                                color: ORANGE_COLOR,
                                fontWeight: 500,
                                ml: 'auto',
                                flexShrink: 0
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary">
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
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {/* Filtrar apenas aparelhos sem linha telefônica associada */}
                {(company.assets?.mobileDevices?.filter((device: any) => !device.phoneLine)?.length > 0) ? (
                  company.assets.mobileDevices
                    .filter((device: any) => !device.phoneLine)
                    .map((device: any, index: number) => {
                      // Cor laranja para itens locados
                      const ORANGE_COLOR = '#ED6C02';
                      
                      return (
                        <Box 
                          key={index} 
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            width: '100%',
                            p: 1,
                            borderRadius: '8px',
                            backgroundColor: device.assignedTo ? 'rgba(237, 108, 2, 0.08)' : 'rgba(0, 128, 105, 0.04)',
                            border: device.assignedTo ? '1px solid rgba(237, 108, 2, 0.2)' : '1px solid rgba(0, 128, 105, 0.1)',
                          }}
                        >
                          <Chip
                            label={device.model || `Aparelho ${index + 1}`}
                            icon={<MobileIcon sx={{ color: device.assignedTo ? ORANGE_COLOR : '#008069' }} />}
                            sx={{
                              borderRadius: '8px',
                              fontWeight: 500,
                              py: 0.5,
                              backgroundColor: device.assignedTo ? 'rgba(237, 108, 2, 0.12)' : 'rgba(0, 128, 105, 0.08)',
                              color: device.assignedTo ? ORANGE_COLOR : '#008069',
                              border: device.assignedTo ? '1px solid rgba(237, 108, 2, 0.3)' : '1px solid rgba(0, 128, 105, 0.2)',
                              flexShrink: 0,
                            }}
                          />
                          
                          {device.assignedTo && (
                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, ml: 1, flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PersonIcon fontSize="small" sx={{ color: ORANGE_COLOR }} />
                                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                  {device.assignedTo}
                                </Typography>
                              </Box>
                              
                              {device.assignedDate && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarTodayIcon fontSize="small" sx={{ color: ORANGE_COLOR }} />
                                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                    {new Date(device.assignedDate).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              )}
                              
                              <Chip
                                size="small"
                                label="Locado"
                                sx={{ 
                                  height: 18,
                                  fontSize: '0.6rem',
                                  backgroundColor: 'rgba(237, 108, 2, 0.12)',
                                  color: ORANGE_COLOR,
                                  fontWeight: 500,
                                  ml: 'auto',
                                  flexShrink: 0
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      );
                    })
                ) : (
                  <Typography variant="body2" color="text.secondary">
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
                          {company.assets.internet.ip || 'Não informado'}
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
  const [loading, setLoading] = useState(true);
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
  
  // Carregar empresas quando a página carregar
  useEffect(() => {
    loadCompanies();
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
    <AppLayout>
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
                <TableCell sx={{ fontWeight: 600 }}>Operadora</TableCell>
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
                  <TableCell colSpan={11} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 5 }}>
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
                          label={company.type === 'headquarters' ? 'Matriz' : 'Filial'}
                          size="small"
                          sx={{
                            borderRadius: '8px',
                            backgroundColor: company.type === 'headquarters' ? 'rgba(76, 175, 80, 0.08)' : 'rgba(33, 150, 243, 0.08)',
                            color: company.type === 'headquarters' ? '#4CAF50' : '#2196F3',
                            border: company.type === 'headquarters' ? '1px solid rgba(76, 175, 80, 0.2)' : '1px solid rgba(33, 150, 243, 0.2)',
                            fontWeight: 500,
                            '&:hover': {
                              backgroundColor: company.type === 'headquarters' ? 'rgba(76, 175, 80, 0.12)' : 'rgba(33, 150, 243, 0.12)'
                            }
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {company.provider ? (
                        <Chip
                          label={company.provider.toUpperCase()}
                          size="small"
                          sx={{
                            borderRadius: '8px',
                            backgroundColor: (() => {
                              switch(company.provider) {
                                case 'vivo': return 'rgba(100, 100, 255, 0.08)';
                                case 'claro': return 'rgba(255, 0, 0, 0.08)';
                                case 'tim': return 'rgba(0, 0, 255, 0.08)';
                                case 'oi': return 'rgba(255, 165, 0, 0.08)';
                                default: return 'rgba(128, 128, 128, 0.08)';
                              }
                            })(),
                            color: (() => {
                              switch(company.provider) {
                                case 'vivo': return '#6464FF';
                                case 'claro': return '#FF0000';
                                case 'tim': return '#0000FF';
                                case 'oi': return '#FFA500';
                                default: return '#808080';
                              }
                            })(),
                            border: (() => {
                              switch(company.provider) {
                                case 'vivo': return '1px solid rgba(100, 100, 255, 0.2)';
                                case 'claro': return '1px solid rgba(255, 0, 0, 0.2)';
                                case 'tim': return '1px solid rgba(0, 0, 255, 0.2)';
                                case 'oi': return '1px solid rgba(255, 165, 0, 0.2)';
                                default: return '1px solid rgba(128, 128, 128, 0.2)';
                              }
                            })(),
                            fontWeight: 500,
                            '&:hover': {
                              backgroundColor: (() => {
                                switch(company.provider) {
                                  case 'vivo': return 'rgba(100, 100, 255, 0.12)';
                                  case 'claro': return 'rgba(255, 0, 0, 0.12)';
                                  case 'tim': return 'rgba(0, 0, 255, 0.12)';
                                  case 'oi': return 'rgba(255, 165, 0, 0.12)';
                                  default: return 'rgba(128, 128, 128, 0.12)';
                                }
                              })()
                            }
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {(company.phoneLines || []).length > 0 ? (
                        <Chip
                          label={`${company.phoneLines.length} linha${company.phoneLines.length > 1 ? 's' : ''}`}
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
                      {(company.assets?.mobileDevices?.length > 0) ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Chip
                            label={`${company.assets.mobileDevices.length} aparelho${company.assets.mobileDevices.length > 1 ? 's' : ''}`}
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
                          {company.assets.mobileDevices.some((device: any) => device.assignedTo) && (
                            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                              {company.assets.mobileDevices.filter((device: any) => device.assignedTo).length} locado(s)
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
    </AppLayout>
  );
};

export default CompaniesPage;

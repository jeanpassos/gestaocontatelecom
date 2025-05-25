import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
  ListItemText
} from '@mui/material';
import CompanyService, { Company } from '../../services/company.service';
import CNPJService from '../../services/cnpj.service';
import CEPService from '../../services/cep.service';
import SegmentService, { Segment } from '../../services/segment.service';

// Propriedades do componente
export interface CompanyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (company: Partial<Company>) => void;
  company?: Company;
  loading: boolean;
}

// Componente de Modal de Empresa (Criar/Editar)
const CompanyModal: React.FC<CompanyModalProps> = ({ 
  open, 
  onClose, 
  onSave, 
  company, 
  loading 
}) => {
  // Definindo uma interface estendida para incluir os campos adicionais
  interface PhoneLine {
    number?: string;
  }
  
  interface MobileDevice {
    model?: string;
  }
  
  interface PendingDocument {
    name: string;
    required: boolean;
  }
  
  interface ExtendedCompany {
    id?: string;
    corporateName?: string;
    tradeName?: string;
    cnpj?: string;
    type?: 'headquarters' | 'branch';
    provider?: 'vivo' | 'claro' | 'tim' | 'oi' | 'other';
    segment?: 'comercio' | 'industria' | 'servicos' | 'tecnologia' | 'saude' | 'educacao' | 'financeiro' | 'agronegocio' | 'construcao' | 'transporte' | 'alimentacao' | 'entretenimento' | 'turismo' | 'outros';
    segments?: string[];
    activationDate?: string;
    contractDate?: string;
    renewalDate?: string;
    address?: {
      street?: string;
      number?: string;
      complement?: string;
      district?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
    contact?: {
      name?: string;
      email?: string;
      phone?: string;
      hasWhatsapp?: boolean;
    };
    internet?: {
      plan?: string;
      speed?: string;
      isFixedIP?: boolean;
    };
    tv?: {
      plan?: string;
      channels?: string;
    };
    usersWithAccess?: string[];
    phoneLines?: PhoneLine[];
    mobileDevices?: MobileDevice[];
    pendingDocuments?: PendingDocument[];
    observation?: string;
    // Campos da interface Company original
    assets?: Record<string, any>;
    assignedUsers?: string[];
    users?: any[];
    createdAt?: string;
    updatedAt?: string;
  }
  
  // Lista padrão de documentos que podem ser marcados como pendentes
  const defaultDocumentsList = [
    { name: 'Contrato', required: true },
    { name: 'Proposta', required: false },
    { name: 'Identidade', required: true },
    { name: 'Comprovante de Endereço', required: true },
    { name: 'Procuração', required: false },
    { name: 'Contrato Social', required: false },
    { name: 'Cartão CNPJ', required: false },
    { name: 'Proposta de Renovação', required: false }
  ];
  
  const [formData, setFormData] = useState<ExtendedCompany>({
    corporateName: '',
    tradeName: '',
    cnpj: '',
    segments: [],
    activationDate: new Date().toISOString().split('T')[0],
    renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    address: {
      street: '',
      number: '',
      complement: '',
      district: '',
      city: '',
      state: '',
      zipCode: ''
    },
    contact: {
      name: '',
      email: '',
      phone: '',
      hasWhatsapp: false
    },
    internet: {
      plan: '',
      speed: '',
      isFixedIP: false
    },
    tv: {
      plan: '',
      channels: ''
    },
    usersWithAccess: [],
    phoneLines: [{ number: '' }],
    mobileDevices: [{ model: '' }],
    pendingDocuments: [],
    observation: ''
  });
  
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [cepError, setCepError] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  
  // Carregar segmentos disponíveis
  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const response = await SegmentService.getAll();
        setSegments(response);
      } catch (error) {
        console.error('Erro ao carregar segmentos:', error);
      }
    };
    
    fetchSegments();
  }, []);
  
  // Carregar dados da empresa para edição
  useEffect(() => {
    if (company) {
      // Tratar company como ExtendedCompany para acessar os campos adicionais
      const extendedCompany = company as unknown as ExtendedCompany;
      
      setFormData({
        ...extendedCompany,
        // Garantir que as datas estejam no formato correto
        activationDate: extendedCompany.activationDate ? 
          new Date(extendedCompany.activationDate).toISOString().split('T')[0] : '',
        renewalDate: extendedCompany.renewalDate ? 
          new Date(extendedCompany.renewalDate).toISOString().split('T')[0] : '',
        // Garantir que os novos campos existam
        internet: extendedCompany.internet || {
          plan: '',
          speed: '',
          isFixedIP: false
        },
        tv: extendedCompany.tv || {
          plan: '',
          channels: ''
        },
        usersWithAccess: extendedCompany.usersWithAccess || [],
        phoneLines: extendedCompany.phoneLines || [{ number: '' }],
        mobileDevices: extendedCompany.mobileDevices || [{ model: '' }]
      });
    } else {
      // Reset para valores padrão ao criar nova empresa
      setFormData({
        corporateName: '',
        tradeName: '',
        cnpj: '',
        segments: [],
        activationDate: new Date().toISOString().split('T')[0],
        renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        address: {
          street: '',
          number: '',
          complement: '',
          district: '',
          city: '',
          state: '',
          zipCode: ''
        },
        contact: {
          name: '',
          email: '',
          phone: '',
          hasWhatsapp: false
        },
        internet: {
          plan: '',
          speed: '',
          isFixedIP: false
        },
        tv: {
          plan: '',
          channels: ''
        },
        usersWithAccess: [],
        phoneLines: [{ number: '' }],
        mobileDevices: [{ model: '' }],
        observation: ''
      });
    }
  }, [company, open]);
  
  // Manipular mudanças nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    if (!name) return;
    
    // Lidar com campos aninhados (address.street, contact.email, etc.)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        // Criar cópias seguras dos objetos aninhados
        const parentObj = parent === 'address' ? {...(prev.address || {})} : 
                         parent === 'contact' ? {...(prev.contact || {})} :
                         parent === 'internet' ? {...(prev.internet || {})} :
                         parent === 'tv' ? {...(prev.tv || {})} : {};
        
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value
          }
        };
      });
    } else if (name === 'cnpj') {
      // Formatar CNPJ
      const numbersOnly = (value as string).replace(/[^\d]/g, '');
      const formattedCNPJ = numbersOnly.replace(/(\d{2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/, (_, p1, p2, p3, p4, p5) => {
        let result = p1;
        if (p2) result += '.' + p2;
        if (p3) result += '.' + p3;
        if (p4) result += '/' + p4;
        if (p5) result += '-' + p5;
        return result;
      });
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedCNPJ
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Manipular mudanças em checkboxes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        // Criar cópias seguras dos objetos aninhados
        const parentObj = parent === 'address' ? {...(prev.address || {})} : 
                         parent === 'contact' ? {...(prev.contact || {})} :
                         parent === 'internet' ? {...(prev.internet || {})} :
                         parent === 'tv' ? {...(prev.tv || {})} : {};
        
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: checked
          }
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };
  
  // Manipular mudanças em campos de seleção múltipla
  const handleMultiSelectChange = (e: any) => {
    const { name, value } = e.target;
    
    if (!name) return;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Buscar dados do CNPJ
  const handleCNPJSearch = async () => {
    if (!formData.cnpj || formData.cnpj.replace(/[^\d]/g, '').length !== 14) {
      setCnpjError('CNPJ inválido');
      return;
    }
    
    setCnpjLoading(true);
    setCnpjError(null);
    
    try {
      const cnpjData = await CNPJService.consultarCNPJ(formData.cnpj);
      
      if (cnpjData) {
        // Adaptar os campos do CNPJ para o formato da aplicação
        setFormData(prev => ({
          ...prev,
          corporateName: cnpjData.nome || prev.corporateName,
          tradeName: cnpjData.fantasia || prev.tradeName,
          address: {
            ...prev.address,
            street: cnpjData.logradouro || prev.address?.street || '',
            number: cnpjData.numero || prev.address?.number || '',
            complement: cnpjData.complemento || prev.address?.complement || '',
            district: cnpjData.bairro || prev.address?.district || '',
            city: cnpjData.municipio || prev.address?.city || '',
            state: cnpjData.uf || prev.address?.state || '',
            zipCode: cnpjData.cep?.replace(/[^\d]/g, '') || prev.address?.zipCode || ''
          }
        }));
      }
    } catch (error) {
      setCnpjError('Erro ao buscar dados do CNPJ');
      console.error('Erro ao buscar CNPJ:', error);
    } finally {
      setCnpjLoading(false);
    }
  };
  
  // Buscar dados do CEP
  const handleCEPSearch = async () => {
    if (!formData.address?.zipCode || formData.address.zipCode.replace(/[^\d]/g, '').length !== 8) {
      setCepError('CEP inválido');
      return;
    }
    
    setCepLoading(true);
    setCepError(null);
    
    try {
      const cepData = await CEPService.consultarCEP(formData.address.zipCode);
      
      if (cepData) {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            street: cepData.logradouro || prev.address?.street || '',
            district: cepData.bairro || prev.address?.district || '',
            city: cepData.localidade || prev.address?.city || '',
            state: cepData.uf || prev.address?.state || '',
            zipCode: prev.address?.zipCode || ''
          }
        }));
      }
    } catch (error) {
      setCepError('Erro ao buscar dados do CEP');
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setCepLoading(false);
    }
  };
  
  // Gerenciar documentos pendentes
  const handlePendingDocumentChange = (documentName: string, isChecked: boolean) => {
    setFormData(prev => {
      const currentPendingDocs = [...(prev.pendingDocuments || [])];
      
      if (isChecked) {
        // Adicionar documento se não existir
        if (!currentPendingDocs.some(doc => doc.name === documentName)) {
          const docToAdd = defaultDocumentsList.find(doc => doc.name === documentName);
          if (docToAdd) {
            currentPendingDocs.push({ ...docToAdd });
          }
        }
      } else {
        // Remover documento
        const index = currentPendingDocs.findIndex(doc => doc.name === documentName);
        if (index !== -1) {
          currentPendingDocs.splice(index, 1);
        }
      }
      
      return {
        ...prev,
        pendingDocuments: currentPendingDocs
      };
    });
  };
  
  // Verificar se um documento está na lista de pendentes
  const isPendingDocument = (documentName: string): boolean => {
    return formData.pendingDocuments?.some(doc => doc.name === documentName) || false;
  };
  
  // Adicionar novos campos para telefones e dispositivos móveis
  const addPhoneLine = () => {
    setFormData(prev => ({
      ...prev,
      phoneLines: [...(prev.phoneLines || []), { number: '' }]
    }));
  };

  const removePhoneLine = (index: number) => {
    setFormData(prev => {
      const newPhoneLines = [...(prev.phoneLines || [])];
      newPhoneLines.splice(index, 1);
      return {
        ...prev,
        phoneLines: newPhoneLines
      };
    });
  };

  const handlePhoneLineChange = (index: number, value: string) => {
    setFormData(prev => {
      const newPhoneLines = [...(prev.phoneLines || [])];
      newPhoneLines[index] = { ...newPhoneLines[index], number: value };
      return {
        ...prev,
        phoneLines: newPhoneLines
      };
    });
  };

  const addMobileDevice = () => {
    setFormData(prev => ({
      ...prev,
      mobileDevices: [...(prev.mobileDevices || []), { model: '' }]
    }));
  };

  const removeMobileDevice = (index: number) => {
    setFormData(prev => {
      const newMobileDevices = [...(prev.mobileDevices || [])];
      newMobileDevices.splice(index, 1);
      return {
        ...prev,
        mobileDevices: newMobileDevices
      };
    });
  };

  const handleMobileDeviceChange = (index: number, value: string) => {
    setFormData(prev => {
      const newMobileDevices = [...(prev.mobileDevices || [])];
      newMobileDevices[index] = { ...newMobileDevices[index], model: value };
      return {
        ...prev,
        mobileDevices: newMobileDevices
      };
    });
  };
  
  // Enviar formulário
  const handleSubmit = () => {
    // Validar campos obrigatórios
    if (!formData.corporateName || !formData.cnpj || !formData.activationDate) {
      return;
    }
    
    // Preparar dados para envio
    const companyData: Partial<Company> = {
      ...company, // Manter dados existentes se for edição
      id: company?.id,
      corporateName: formData.corporateName,
      // tradeName não existe na interface Company, então vamos armazená-lo em assets
      cnpj: formData.cnpj,
      segment: formData.segments && formData.segments.length > 0 ? 
        formData.segments[0] as 'comercio' | 'industria' | 'servicos' | 'tecnologia' | 'saude' | 'educacao' | 'financeiro' | 'agronegocio' | 'construcao' | 'transporte' | 'alimentacao' | 'entretenimento' | 'turismo' | 'outros' : 
        undefined,
      contractDate: formData.activationDate,
      renewalDate: formData.renewalDate,
      address: formData.address,
      manager: formData.contact ? {
        name: formData.contact.name,
        email: formData.contact.email,
        phone: formData.contact.phone,
        hasWhatsapp: formData.contact.hasWhatsapp
      } : undefined,
      observation: formData.observation,
      // Converter phoneLines para o formato esperado pela API
      phoneLines: formData.phoneLines?.map(line => line.number || '').filter(Boolean) || [],
      // Outros campos adicionados
      assets: {
        tradeName: formData.tradeName, // Armazenando tradeName em assets
        internet: formData.internet,
        tv: formData.tv,
        mobileDevices: formData.mobileDevices,
        pendingDocuments: formData.pendingDocuments?.map(doc => doc.name) || []
      }
    };
    
    onSave(companyData);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{company ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Informações Básicas */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Informações da Empresa
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Razão Social"
                name="corporateName"
                value={formData.corporateName || ''}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome Fantasia"
                name="tradeName"
                value={formData.tradeName || ''}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CNPJ"
                name="cnpj"
                value={formData.cnpj || ''}
                onChange={handleChange}
                placeholder="XX.XXX.XXX/XXXX-XX"
                required
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <Button 
                      onClick={handleCNPJSearch} 
                      disabled={cnpjLoading}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      {cnpjLoading ? <CircularProgress size={20} /> : 'Buscar'}
                    </Button>
                  )
                }}
              />
              {cnpjError && <Alert severity="error" sx={{ mb: 2 }}>{cnpjError}</Alert>}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="segments-label">Segmentos</InputLabel>
                <Select
                  labelId="segments-label"
                  multiple
                  name="segments"
                  value={formData.segments || []}
                  onChange={handleMultiSelectChange}
                  input={<OutlinedInput label="Segmentos" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => {
                        const segment = segments.find(s => s.id === value);
                        return <Chip key={value} label={segment?.name || value} />;
                      })}
                    </Box>
                  )}
                >
                  {segments.map((segment) => (
                    <MenuItem key={segment.id} value={segment.id}>
                      <Checkbox checked={(formData.segments || []).indexOf(segment.id) > -1} />
                      <ListItemText primary={segment.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Ativação"
                name="activationDate"
                type="date"
                value={formData.activationDate || ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Renovação"
                name="renewalDate"
                type="date"
                value={formData.renewalDate || ''}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
                helperText="Se não informado, será calculado automaticamente como 1 ano após a ativação"
              />
            </Grid>
            
            {/* Endereço */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
                Endereço
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="CEP"
                name="address.zipCode"
                value={formData.address?.zipCode || ''}
                onChange={handleChange}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <Button 
                      onClick={handleCEPSearch} 
                      disabled={cepLoading}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      {cepLoading ? <CircularProgress size={20} /> : 'Buscar'}
                    </Button>
                  )
                }}
              />
              {cepError && <Alert severity="error" sx={{ mb: 2 }}>{cepError}</Alert>}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Logradouro"
                name="address.street"
                value={formData.address?.street || ''}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Número"
                name="address.number"
                value={formData.address?.number || ''}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Complemento"
                name="address.complement"
                value={formData.address?.complement || ''}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bairro"
                name="address.district"
                value={formData.address?.district || ''}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cidade"
                name="address.city"
                value={formData.address?.city || ''}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estado"
                name="address.state"
                value={formData.address?.state || ''}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            {/* Contato */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
                Contato
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Nome do Contato"
                name="contact.name"
                value={formData.contact?.name || ''}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Email"
                name="contact.email"
                type="email"
                value={formData.contact?.email || ''}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Telefone"
                name="contact.phone"
                value={formData.contact?.phone || ''}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.contact?.hasWhatsapp || false}
                    onChange={handleCheckboxChange}
                    name="contact.hasWhatsapp"
                  />
                }
                label="WhatsApp"
                sx={{ mt: 1 }}
              />
            </Grid>
            
            {/* Internet */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
                Internet
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Plano de Internet"
                name="internet.plan"
                value={formData.internet?.plan || ''}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Velocidade"
                name="internet.speed"
                value={formData.internet?.speed || ''}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.internet?.isFixedIP || false}
                    onChange={handleCheckboxChange}
                    name="internet.isFixedIP"
                  />
                }
                label="IP Fixo"
                sx={{ mt: 1 }}
              />
            </Grid>
            
            {/* TV */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
                TV
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Plano de TV"
                name="tv.plan"
                value={formData.tv?.plan || ''}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Canais"
                name="tv.channels"
                value={formData.tv?.channels || ''}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            {/* A seção de Usuários com Acesso foi removida conforme solicitado */}
            
            {/* Linhas Telefônicas */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
                Linhas Telefônicas
              </Typography>
            </Grid>
            
            {formData.phoneLines?.map((line, index) => (
              <Grid item xs={12} key={`phone-${index}`} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  fullWidth
                  label={`Linha ${index + 1}`}
                  value={line.number || ''}
                  onChange={(e) => handlePhoneLineChange(index, e.target.value)}
                  sx={{ mr: 1 }}
                />
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={() => removePhoneLine(index)}
                  disabled={formData.phoneLines?.length === 1}
                >
                  Remover
                </Button>
              </Grid>
            ))}
            
            <Grid item xs={12} sx={{ mb: 2 }}>
              <Button variant="outlined" onClick={addPhoneLine}>
                Adicionar Linha Telefônica
              </Button>
            </Grid>
            
            {/* Aparelhos Celulares */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
                Aparelhos Celulares
              </Typography>
            </Grid>
            
            {formData.mobileDevices?.map((device, index) => (
              <Grid item xs={12} key={`device-${index}`} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  fullWidth
                  label={`Aparelho ${index + 1}`}
                  value={device.model || ''}
                  onChange={(e) => handleMobileDeviceChange(index, e.target.value)}
                  sx={{ mr: 1 }}
                />
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={() => removeMobileDevice(index)}
                  disabled={formData.mobileDevices?.length === 1}
                >
                  Remover
                </Button>
              </Grid>
            ))}
            
            <Grid item xs={12} sx={{ mb: 2 }}>
              <Button variant="outlined" onClick={addMobileDevice}>
                Adicionar Aparelho Celular
              </Button>
            </Grid>
            
            {/* Documentos Pendentes */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
                Documentos Pendentes
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Selecione os documentos que estão pendentes para esta empresa:
              </Typography>
              
              <Grid container spacing={2}>
                {defaultDocumentsList.map((doc) => (
                  <Grid item xs={12} sm={6} md={4} key={doc.name}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isPendingDocument(doc.name)}
                          onChange={(e) => handlePendingDocumentChange(doc.name, e.target.checked)}
                          name={`pending-${doc.name}`}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2">
                            {doc.name}
                          </Typography>
                          {doc.required && (
                            <Chip 
                              label="Obrigatório" 
                              color="error" 
                              size="small" 
                              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                            />
                          )}
                        </Box>
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            
            {/* Observações */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
                Observações
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                name="observation"
                value={formData.observation || ''}
                onChange={handleChange}
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !formData.corporateName || !formData.cnpj || !formData.activationDate}
        >
          {loading ? <CircularProgress size={24} /> : (company ? 'Atualizar' : 'Criar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompanyModal;

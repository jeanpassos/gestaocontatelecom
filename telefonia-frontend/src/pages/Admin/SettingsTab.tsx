import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Tooltip,
  CircularProgress,
  useTheme
} from '@mui/material';
import SegmentsSection from './SegmentsSection';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  InfoOutlined as InfoIcon,
  NotificationsActive as NotificationIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  CloudUpload as CloudUploadIcon,
  AccountBalance as BillingIcon,
  Public as PublicIcon,
  Api as ApiIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

// Seção de configurações
interface SettingSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({ 
  title, 
  description, 
  icon, 
  children 
}) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        mb: 3
      }}
    >
      <CardHeader
        avatar={
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        }
        title={
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        }
        subheader={description}
      />
      <Divider />
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

// Componente de campo de configuração
interface SettingFieldProps {
  label: string;
  tooltip?: string;
  children: React.ReactNode;
}

const SettingField: React.FC<SettingFieldProps> = ({ 
  label, 
  tooltip, 
  children 
}) => {
  return (
    <Box sx={{ py: 1.5, display: 'flex', alignItems: 'center' }}>
      <Box sx={{ flex: '0 0 300px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {label}
          </Typography>
          {tooltip && (
            <Tooltip title={tooltip} arrow>
              <IconButton size="small" sx={{ ml: 0.5 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      <Box sx={{ flex: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

// Guia de Configurações
const SettingsTab: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Estados para as configurações
  const [settings, setSettings] = useState({
    // Notificações
    emailNotifications: true,
    paymentReminders: true,
    reminderDays: 5,
    
    // Segurança
    passwordExpiration: 90,
    twoFactorAuth: false,
    sessionTimeout: 30,
    
    // Armazenamento
    autoDeleteOldInvoices: false,
    invoiceRetentionMonths: 36,
    backupFrequency: 'daily',
    
    // Faturas
    defaultInvoiceStatus: 'pending',
    ocr: true,
    autoDetectProvider: true,
    
    // Faturamento
    paymentGracePeriod: 3,
    currency: 'BRL',
    fiscalYear: 'calendar',
    
    // APIs Externas
    cnpjApiProvider: 'receitaws',
    cnpjApiKey: '',
    cnpjUseBackend: true,
    cepApiProvider: 'viacep',
    cepApiKey: '',
    cepUseBackend: true
  });
  
  // Manipular alterações nos campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Manipular alterações nos selects
  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setSettings({
        ...settings,
        [name]: value
      });
    }
  };
  
  // Salvar configurações
  const handleSaveSettings = () => {
    setLoading(true);
    
    // Simulação de chamada à API
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Remover mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1500);
  };
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Configurações do Sistema
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={loading}
          >
            Restaurar Padrões
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSaveSettings}
            disabled={loading}
            sx={{
              borderRadius: '10px',
              fontWeight: 600,
              boxShadow: '0 4px 10px rgba(0, 122, 255, 0.3)',
            }}
          >
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </Box>
      </Box>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Configurações salvas com sucesso!
        </Alert>
      )}
      
      {/* Notificações */}
      <SettingSection
        title="Notificações"
        description="Configure como o sistema notifica usuários sobre eventos importantes."
        icon={<NotificationIcon />}
      >
        <SettingField 
          label="Notificações por email" 
          tooltip="Enviar notificações do sistema por email para os usuários."
        >
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={handleChange}
                name="emailNotifications"
                color="primary"
              />
            }
            label="Ativado"
          />
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Lembretes de pagamento" 
          tooltip="Enviar lembretes de faturas próximas do vencimento."
        >
          <FormControlLabel
            control={
              <Switch
                checked={settings.paymentReminders}
                onChange={handleChange}
                name="paymentReminders"
                color="primary"
              />
            }
            label="Ativado"
          />
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Dias para lembrete" 
          tooltip="Quantos dias antes do vencimento enviar lembretes."
        >
          <TextField
            type="number"
            inputProps={{ min: 1, max: 30 }}
            value={settings.reminderDays}
            onChange={handleChange}
            name="reminderDays"
            size="small"
            disabled={!settings.paymentReminders}
            sx={{ width: 100 }}
          />
        </SettingField>
      </SettingSection>
      
      {/* Segurança */}
      <SettingSection
        title="Segurança"
        description="Configure as políticas de segurança e acesso ao sistema."
        icon={<SecurityIcon />}
      >
        <SettingField 
          label="Expiração de senha (dias)" 
          tooltip="Número de dias até que senhas expirem e precisem ser trocadas."
        >
          <TextField
            type="number"
            inputProps={{ min: 0, max: 365 }}
            value={settings.passwordExpiration}
            onChange={handleChange}
            name="passwordExpiration"
            size="small"
            sx={{ width: 100 }}
            helperText="0 = sem expiração"
          />
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Autenticação de dois fatores" 
          tooltip="Exigir verificação adicional no login."
        >
          <FormControlLabel
            control={
              <Switch
                checked={settings.twoFactorAuth}
                onChange={handleChange}
                name="twoFactorAuth"
                color="primary"
              />
            }
            label="Obrigatório para todos os usuários"
          />
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Timeout de sessão (minutos)" 
          tooltip="Tempo de inatividade até o logout automático."
        >
          <TextField
            type="number"
            inputProps={{ min: 5, max: 240 }}
            value={settings.sessionTimeout}
            onChange={handleChange}
            name="sessionTimeout"
            size="small"
            sx={{ width: 100 }}
          />
        </SettingField>
      </SettingSection>
      
      {/* Armazenamento */}
      <SettingSection
        title="Armazenamento & Backup"
        description="Configure como o sistema gerencia dados e backups."
        icon={<StorageIcon />}
      >
        <SettingField 
          label="Exclusão automática de faturas" 
          tooltip="Excluir automaticamente faturas antigas."
        >
          <FormControlLabel
            control={
              <Switch
                checked={settings.autoDeleteOldInvoices}
                onChange={handleChange}
                name="autoDeleteOldInvoices"
                color="primary"
              />
            }
            label="Ativado"
          />
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Retenção de faturas (meses)" 
          tooltip="Por quanto tempo manter faturas no sistema."
        >
          <TextField
            type="number"
            inputProps={{ min: 12, max: 120 }}
            value={settings.invoiceRetentionMonths}
            onChange={handleChange}
            name="invoiceRetentionMonths"
            size="small"
            sx={{ width: 100 }}
            disabled={!settings.autoDeleteOldInvoices}
          />
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Frequência de backup" 
          tooltip="Com que frequência realizar backups automáticos."
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={settings.backupFrequency}
              onChange={handleSelectChange as any}
              name="backupFrequency"
            >
              <MenuItem value="hourly">A cada hora</MenuItem>
              <MenuItem value="daily">Diário</MenuItem>
              <MenuItem value="weekly">Semanal</MenuItem>
              <MenuItem value="monthly">Mensal</MenuItem>
            </Select>
          </FormControl>
        </SettingField>
      </SettingSection>
      
      {/* Faturas */}
      <SettingSection
        title="Processamento de Faturas"
        description="Configure como as faturas são processadas e categorizadas."
        icon={<CloudUploadIcon />}
      >
        <SettingField 
          label="Status padrão para novas faturas" 
          tooltip="Status atribuído automaticamente a novas faturas."
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={settings.defaultInvoiceStatus}
              onChange={handleSelectChange as any}
              name="defaultInvoiceStatus"
            >
              <MenuItem value="pending">Pendente</MenuItem>
              <MenuItem value="paid">Pago</MenuItem>
              <MenuItem value="processing">Em processamento</MenuItem>
            </Select>
          </FormControl>
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="OCR para extração de dados" 
          tooltip="Usar reconhecimento óptico de caracteres para extrair dados de PDFs."
        >
          <FormControlLabel
            control={
              <Switch
                checked={settings.ocr}
                onChange={handleChange}
                name="ocr"
                color="primary"
              />
            }
            label="Ativado"
          />
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Detecção automática de operadora" 
          tooltip="Detectar automaticamente a operadora com base no modelo da fatura."
        >
          <FormControlLabel
            control={
              <Switch
                checked={settings.autoDetectProvider}
                onChange={handleChange}
                name="autoDetectProvider"
                color="primary"
              />
            }
            label="Ativado"
          />
        </SettingField>
      </SettingSection>
      
      {/* Faturamento */}
      <SettingSection
        title="Faturamento"
        description="Configure como o sistema lida com pagamentos e faturamento."
        icon={<BillingIcon />}
      >
        <SettingField 
          label="Período de carência para pagamento" 
          tooltip="Número de dias de carência para pagamento após o vencimento."
        >
          <TextField
            type="number"
            size="small"
            name="paymentGracePeriod"
            value={settings.paymentGracePeriod}
            onChange={handleChange}
            InputProps={{
              endAdornment: <InputAdornment position="end">dias</InputAdornment>,
            }}
            sx={{ width: 150 }}
          />
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Moeda padrão" 
          tooltip="Moeda usada para valores monetários no sistema."
        >
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={settings.currency}
              onChange={handleSelectChange as any}
              name="currency"
            >
              <MenuItem value="BRL">Real (BRL)</MenuItem>
              <MenuItem value="USD">Dólar (USD)</MenuItem>
              <MenuItem value="EUR">Euro (EUR)</MenuItem>
            </Select>
          </FormControl>
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Ano fiscal" 
          tooltip="Define como o sistema calcula o ano fiscal para relatórios."
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={settings.fiscalYear}
              onChange={handleSelectChange as any}
              name="fiscalYear"
            >
              <MenuItem value="calendar">Ano Calendário (Jan-Dez)</MenuItem>
              <MenuItem value="custom">Personalizado</MenuItem>
            </Select>
          </FormControl>
        </SettingField>
      </SettingSection>
      
      {/* APIs Externas */}
      <SettingSection
        title="APIs Externas"
        description="Configure as APIs externas para consulta de CNPJ e CEP."
        icon={<ApiIcon />}
      >
        <Alert severity="info" sx={{ mb: 2 }}>
          Para utilizar as APIs externas, selecione o provedor desejado e clique no ícone de informação <InfoIcon fontSize="small" /> ao lado de cada opção para obter instruções sobre como se cadastrar e obter sua chave de API (quando necessário).
        </Alert>
        {/* Configurações de API de CNPJ */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.primary.main }}>
          Consulta de CNPJ
        </Typography>
        
        <SettingField 
          label="Provedor de API de CNPJ" 
          tooltip="Selecione o provedor de API para consulta de CNPJ. Clique no ícone de informação ao lado de cada opção para saber como obter a chave da API."
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={settings.cnpjApiProvider}
              onChange={handleSelectChange as any}
              name="cnpjApiProvider"
            >
              <MenuItem value="receitaws">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>ReceitaWS</span>
                  <Tooltip title="Cadastre-se em https://receitaws.com.br/api e obtenha sua chave de API" arrow>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open('https://receitaws.com.br/api', '_blank');
                      }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </MenuItem>
              <MenuItem value="cnpjws">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>CNPJ.ws</span>
                  <Tooltip title="Cadastre-se em https://cnpj.ws/cadastro e obtenha sua chave de API" arrow>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open('https://cnpj.ws/cadastro', '_blank');
                      }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </MenuItem>
              <MenuItem value="brasilapi">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>Brasil API</span>
                  <Tooltip title="Acesse https://brasilapi.com.br/docs para mais informações" arrow>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open('https://brasilapi.com.br/docs', '_blank');
                      }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </MenuItem>
              <MenuItem value="custom">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>API Personalizada</span>
                  <Tooltip title="Configure sua própria API de consulta de CNPJ" arrow>
                    <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </SettingField>
        
        <SettingField 
          label="Chave de API de CNPJ" 
          tooltip="Chave de API para o provedor selecionado. Clique no ícone de informação ao lado do provedor para saber como obter sua chave."
        >
          <TextField
            type="password"
            size="small"
            name="cnpjApiKey"
            value={settings.cnpjApiKey}
            onChange={handleChange}
            placeholder="Insira sua chave de API"
            sx={{ width: 300 }}
          />
        </SettingField>
        
        <SettingField 
          label="Usar backend para consultas" 
          tooltip="Se ativado, as consultas serão feitas através do backend para proteger a chave de API."
        >
          <FormControlLabel
            control={
              <Switch
                checked={settings.cnpjUseBackend}
                onChange={handleChange}
                name="cnpjUseBackend"
                color="primary"
              />
            }
            label=""
          />
        </SettingField>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Configurações de API de CEP */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.primary.main }}>
          Consulta de CEP
        </Typography>
        
        <SettingField 
          label="Provedor de API de CEP" 
          tooltip="Selecione o provedor de API para consulta de CEP. Clique no ícone de informação ao lado de cada opção para saber como obter a chave da API."
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={settings.cepApiProvider}
              onChange={handleSelectChange as any}
              name="cepApiProvider"
            >
              <MenuItem value="viacep">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>ViaCEP</span>
                  <Tooltip title="Acesse https://viacep.com.br/ - API gratuita que não requer chave" arrow>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open('https://viacep.com.br/', '_blank');
                      }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </MenuItem>
              <MenuItem value="brasilapi">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>Brasil API</span>
                  <Tooltip title="Acesse https://brasilapi.com.br/docs - API gratuita que não requer chave" arrow>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open('https://brasilapi.com.br/docs', '_blank');
                      }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </MenuItem>
              <MenuItem value="postmon">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>Postmon</span>
                  <Tooltip title="Acesse https://postmon.com.br/ - API gratuita que não requer chave" arrow>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open('https://postmon.com.br/', '_blank');
                      }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </MenuItem>
              <MenuItem value="custom">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>API Personalizada</span>
                  <Tooltip title="Configure sua própria API de consulta de CEP" arrow>
                    <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </SettingField>
        
        <SettingField 
          label="Chave de API de CEP" 
          tooltip="Chave de API para o provedor selecionado. A maioria das APIs de CEP são gratuitas e não requerem chave. Clique no ícone de informação ao lado do provedor para mais detalhes."
        >
          <TextField
            type="password"
            size="small"
            name="cepApiKey"
            value={settings.cepApiKey}
            onChange={handleChange}
            placeholder="Insira sua chave de API"
            sx={{ width: 300 }}
          />
        </SettingField>
        
        <SettingField 
          label="Usar backend para consultas" 
          tooltip="Se ativado, as consultas serão feitas através do backend para proteger a chave de API."
        >
          <FormControlLabel
            control={
              <Switch
                checked={settings.cepUseBackend}
                onChange={handleChange}
                name="cepUseBackend"
                color="primary"
              />
            }
            label=""
          />
        </SettingField>
      </SettingSection>
      
      {/* Seção de Segmentos de Empresas */}
      <SettingSection
        title="Segmentos de Empresas"
        description="Gerencie os segmentos disponíveis para classificar as empresas."
        icon={<CategoryIcon />}
      >
        <SegmentsSection />
      </SettingSection>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSaveSettings}
          disabled={loading}
          sx={{
            borderRadius: '10px',
            fontWeight: 600,
            px: 4,
            py: 1.2,
            boxShadow: '0 4px 10px rgba(0, 122, 255, 0.3)',
          }}
        >
          {loading ? 'Salvando...' : 'Salvar Todas as Configurações'}
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsTab;

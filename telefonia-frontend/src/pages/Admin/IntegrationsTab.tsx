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
  useTheme,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  InfoOutlined as InfoIcon,
  NotificationsActive as NotificationIcon,
  Security as SecurityIcon,
  Api as ApiIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Webhook as WebhookIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon
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
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ width: '40%', display: 'flex', alignItems: 'center' }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip} arrow>
            <IconButton size="small" sx={{ ml: 0.5 }}>
              <InfoIcon fontSize="small" color="action" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Box sx={{ width: '60%' }}>
        {children}
      </Box>
    </Box>
  );
};

// Status de conexão
interface ConnectionStatusProps {
  connected: boolean;
  lastSync?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ connected, lastSync }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
      <Chip
        icon={connected ? <CheckIcon /> : <ErrorIcon />}
        label={connected ? 'Conectado' : 'Desconectado'}
        color={connected ? 'success' : 'error'}
        size="small"
        variant="outlined"
      />
      {connected && lastSync && (
        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
          Última sincronização: {lastSync}
        </Typography>
      )}
    </Box>
  );
};

// Guia de Integrações
const IntegrationsTab: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Estados para as configurações
  const [settings, setSettings] = useState({
    // APIs Externas
    apiEnabled: true,
    apiKey: 'sk_test_51KjLdSaFgHgTyu7uHgTyuHgTyuHgTyuHgTyuHgTyuHgTyuHgTyuHgTyu',
    apiRateLimit: 100,
    apiVersion: 'v1',
    
    // API de CNPJ
    cnpjApiEnabled: true,
    cnpjApiProvider: 'receitaws',
    cnpjApiKey: '',
    cnpjUseCache: true,
    cnpjCacheDuration: 30,
    cnpjCustomProvider: '',
    cnpjCustomUrl: '',
    cnpjCustomApiKey: '',
    cnpjCustomAuthFormat: 'header',
    cnpjCustomParams: '',
    
    // API de CEP
    cepApiEnabled: true,
    cepApiProvider: 'viacep',
    cepApiKey: '',
    cepUseCache: true,
    cepCacheDuration: 30,
    cepCustomProvider: '',
    cepCustomUrl: '',
    cepCustomApiKey: '',
    cepCustomAuthFormat: 'header',
    cepCustomParams: '',
    
    // Notificações
    emailEnabled: true,
    emailProvider: 'smtp',
    emailApiKey: 'SG.1234567890.abcdefghijklmnopqrstuvwxyz', // Usado apenas para provedores baseados em API
    emailFromAddress: 'notificacoes@empresa.com.br',
    emailSmtpServer: 'smtp.empresa.com.br',
    emailSmtpPort: 587,
    emailSmtpUsername: 'smtp_user',
    emailSmtpPassword: 'smtp_password',
    emailSmtpSecurity: 'tls',
    
    smsEnabled: false,
    smsProvider: 'twilio',
    smsApiKey: '',
    smsFromNumber: '',
    
    webhookEnabled: false,
    webhookUrl: '',
    webhookSecret: '',
    
    // Configurações de Notificações
    notifyOnNewInvoice: true,
    notifyOnPaymentDue: true,
    notifyOnPaymentReceived: true,
    notifyOnLatePayment: true,
    notifyDaysBeforeDue: 3,
    notificationTemplate: 'default'
  });
  
  // Conexões
  const [connections] = useState({
    apiConnected: true,
    apiLastSync: '18/05/2025 14:30',
    emailConnected: true,
    emailLastSync: '18/05/2025 14:25',
    smsConnected: false,
    smsLastSync: '',
    webhookConnected: false,
    webhookLastSync: ''
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
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1500);
  };
  
  // Testar conexão
  const handleTestConnection = (type: string) => {
    setLoading(true);
    
    // Simulação de teste de conexão
    setTimeout(() => {
      setLoading(false);
      alert(`Conexão com ${type} testada com sucesso!`);
    }, 1500);
  };
  
  return (
    <Box>
      {/* Mensagem de sucesso */}
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, borderRadius: '10px' }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setSuccess(false)}
            >
              <RefreshIcon fontSize="inherit" />
            </IconButton>
          }
        >
          Configurações salvas com sucesso!
        </Alert>
      )}
      
      {/* API Principal */}
      <SettingSection
        title="Configuração de API Principal"
        description="Configure a API principal para integração com outros sistemas."
        icon={<ApiIcon />}
      >
        <SettingField 
          label="API Ativa" 
          tooltip="Ativar ou desativar a API."
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.apiEnabled}
                  onChange={handleChange}
                  name="apiEnabled"
                  color="primary"
                />
              }
              label="Ativada"
            />
            <ConnectionStatus 
              connected={connections.apiConnected} 
              lastSync={connections.apiLastSync} 
            />
          </Box>
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Chave de API" 
          tooltip="Chave para autenticação na API."
        >
          <TextField
            value={settings.apiKey}
            onChange={handleChange}
            name="apiKey"
            type="password"
            size="small"
            fullWidth
            disabled={!settings.apiEnabled}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => alert('Nova chave gerada!')}
                    disabled={!settings.apiEnabled}
                  >
                    Gerar Nova
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Limite de Requisições" 
          tooltip="Número máximo de requisições por minuto."
        >
          <TextField
            value={settings.apiRateLimit}
            onChange={handleChange}
            name="apiRateLimit"
            type="number"
            size="small"
            sx={{ width: 100 }}
            disabled={!settings.apiEnabled}
            InputProps={{
              endAdornment: <InputAdornment position="end">req/min</InputAdornment>,
            }}
          />
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Versão da API" 
          tooltip="Versão da API a ser utilizada."
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={settings.apiVersion}
              onChange={handleSelectChange as any}
              name="apiVersion"
              disabled={!settings.apiEnabled}
            >
              <MenuItem value="v1">v1 (Estável)</MenuItem>
              <MenuItem value="v2">v2 (Beta)</MenuItem>
              <MenuItem value="v3">v3 (Alpha)</MenuItem>
            </Select>
          </FormControl>
        </SettingField>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleTestConnection('API')}
            disabled={!settings.apiEnabled || loading}
            sx={{ mr: 1 }}
          >
            Testar Conexão
          </Button>
        </Box>
      </SettingSection>
      
      {/* API de CNPJ */}
      <SettingSection
        title="API de Consulta de CNPJ"
        description="Configure a API para consulta de dados de empresas por CNPJ."
        icon={<BusinessIcon />}
      >
        <SettingField 
          label="API Ativa" 
          tooltip="Ativar ou desativar a API de consulta de CNPJ."
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.cnpjApiEnabled}
                  onChange={handleChange}
                  name="cnpjApiEnabled"
                  color="primary"
                />
              }
              label="Ativada"
            />
          </Box>
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Provedor" 
          tooltip="Serviço utilizado para consulta de CNPJ."
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={settings.cnpjApiProvider}
              onChange={handleSelectChange as any}
              name="cnpjApiProvider"
              disabled={!settings.cnpjApiEnabled}
            >
              <MenuItem value="receitaws">ReceitaWS</MenuItem>
              <MenuItem value="brasilapi">Brasil API</MenuItem>
              <MenuItem value="cnpja">CNPJ.a</MenuItem>
              <MenuItem value="speedio">Speedio</MenuItem>
              <MenuItem value="serpro">SERPRO</MenuItem>
              <MenuItem value="custom">Personalizado</MenuItem>
            </Select>
          </FormControl>
        </SettingField>
        
        {settings.cnpjApiProvider === 'custom' ? (
          <>
            <SettingField 
              label="Nome do Provedor" 
              tooltip="Nome do provedor personalizado."
            >
              <TextField
                placeholder="Ex: API de CNPJ XYZ"
                value={settings.cnpjCustomProvider}
                onChange={handleChange}
                name="cnpjCustomProvider"
                size="small"
                fullWidth
                disabled={!settings.cnpjApiEnabled}
              />
            </SettingField>
            
            <SettingField 
              label="URL da API" 
              tooltip="URL base da API do provedor."
            >
              <TextField
                placeholder="Ex: https://api.provedor.com/v1/cnpj"
                value={settings.cnpjCustomUrl}
                onChange={handleChange}
                name="cnpjCustomUrl"
                size="small"
                fullWidth
                disabled={!settings.cnpjApiEnabled}
              />
            </SettingField>
            
            <SettingField 
              label="Formato de Autenticação" 
              tooltip="Como a chave de API deve ser enviada."
            >
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={settings.cnpjCustomAuthFormat}
                  onChange={handleSelectChange as any}
                  name="cnpjCustomAuthFormat"
                  disabled={!settings.cnpjApiEnabled}
                >
                  <MenuItem value="header">Cabeçalho de Autenticação</MenuItem>
                  <MenuItem value="bearer">Bearer Token</MenuItem>
                  <MenuItem value="basic">Basic Auth</MenuItem>
                  <MenuItem value="query">Parâmetro de Query</MenuItem>
                </Select>
              </FormControl>
            </SettingField>
          </>
        ) : null}
        
        <SettingField 
          label="Chave de API" 
          tooltip="Chave para autenticação no provedor de consulta de CNPJ."
        >
          <TextField
            value={settings.cnpjApiProvider === 'custom' ? settings.cnpjCustomApiKey : settings.cnpjApiKey}
            onChange={handleChange}
            name={settings.cnpjApiProvider === 'custom' ? "cnpjCustomApiKey" : "cnpjApiKey"}
            type="password"
            size="small"
            fullWidth
            disabled={!settings.cnpjApiEnabled}
          />
        </SettingField>
        
        {settings.cnpjApiProvider === 'custom' && (
          <SettingField 
            label="Parâmetros Adicionais" 
            tooltip="Parâmetros adicionais em formato JSON."
          >
            <TextField
              placeholder='Ex: {"format": "json", "timeout": 30}'
              value={settings.cnpjCustomParams}
              onChange={handleChange}
              name="cnpjCustomParams"
              size="small"
              fullWidth
              multiline
              rows={2}
              disabled={!settings.cnpjApiEnabled}
            />
          </SettingField>
        )}
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Usar Cache" 
          tooltip="Armazenar resultados em cache para reduzir o número de requisições."
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.cnpjUseCache}
                  onChange={handleChange}
                  name="cnpjUseCache"
                  color="primary"
                />
              }
              label="Ativado"
            />
            {settings.cnpjUseCache && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Duração:
                </Typography>
                <TextField
                  value={settings.cnpjCacheDuration}
                  onChange={handleChange}
                  name="cnpjCacheDuration"
                  type="number"
                  size="small"
                  sx={{ width: 70 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">dias</InputAdornment>,
                  }}
                />
              </Box>
            )}
          </Box>
        </SettingField>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleTestConnection('CNPJ')}
            disabled={!settings.cnpjApiEnabled || loading}
            sx={{ mr: 1 }}
          >
            Testar Conexão
          </Button>
        </Box>
      </SettingSection>
      
      {/* API de CEP */}
      <SettingSection
        title="API de Consulta de CEP"
        description="Configure a API para consulta de endereços por CEP."
        icon={<LocationOnIcon />}
      >
        <SettingField 
          label="API Ativa" 
          tooltip="Ativar ou desativar a API de consulta de CEP."
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.cepApiEnabled}
                  onChange={handleChange}
                  name="cepApiEnabled"
                  color="primary"
                />
              }
              label="Ativada"
            />
          </Box>
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Provedor" 
          tooltip="Serviço utilizado para consulta de CEP."
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={settings.cepApiProvider}
              onChange={handleSelectChange as any}
              name="cepApiProvider"
              disabled={!settings.cepApiEnabled}
            >
              <MenuItem value="viacep">ViaCEP</MenuItem>
              <MenuItem value="brasilapi">Brasil API</MenuItem>
              <MenuItem value="postmon">Postmon</MenuItem>
              <MenuItem value="apicep">ApiCEP</MenuItem>
              <MenuItem value="widenet">WideNet</MenuItem>
              <MenuItem value="custom">Personalizado</MenuItem>
            </Select>
          </FormControl>
        </SettingField>
        
        {settings.cepApiProvider === 'custom' ? (
          <>
            <SettingField 
              label="Nome do Provedor" 
              tooltip="Nome do provedor personalizado."
            >
              <TextField
                placeholder="Ex: API de CEP XYZ"
                value={settings.cepCustomProvider}
                onChange={handleChange}
                name="cepCustomProvider"
                size="small"
                fullWidth
                disabled={!settings.cepApiEnabled}
              />
            </SettingField>
            
            <SettingField 
              label="URL da API" 
              tooltip="URL base da API do provedor."
            >
              <TextField
                placeholder="Ex: https://api.provedor.com/v1/cep"
                value={settings.cepCustomUrl}
                onChange={handleChange}
                name="cepCustomUrl"
                size="small"
                fullWidth
                disabled={!settings.cepApiEnabled}
              />
            </SettingField>
            
            <SettingField 
              label="Formato de Autenticação" 
              tooltip="Como a chave de API deve ser enviada."
            >
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={settings.cepCustomAuthFormat}
                  onChange={handleSelectChange as any}
                  name="cepCustomAuthFormat"
                  disabled={!settings.cepApiEnabled}
                >
                  <MenuItem value="header">Cabeçalho de Autenticação</MenuItem>
                  <MenuItem value="bearer">Bearer Token</MenuItem>
                  <MenuItem value="basic">Basic Auth</MenuItem>
                  <MenuItem value="query">Parâmetro de Query</MenuItem>
                </Select>
              </FormControl>
            </SettingField>
          </>
        ) : null}
        
        <SettingField 
          label="Chave de API" 
          tooltip="Chave para autenticação no provedor de consulta de CEP."
        >
          <TextField
            value={settings.cepApiProvider === 'custom' ? settings.cepCustomApiKey : settings.cepApiKey}
            onChange={handleChange}
            name={settings.cepApiProvider === 'custom' ? "cepCustomApiKey" : "cepApiKey"}
            type="password"
            size="small"
            fullWidth
            disabled={!settings.cepApiEnabled}
          />
        </SettingField>
        
        {settings.cepApiProvider === 'custom' && (
          <SettingField 
            label="Parâmetros Adicionais" 
            tooltip="Parâmetros adicionais em formato JSON."
          >
            <TextField
              placeholder='Ex: {"format": "json", "timeout": 30}'
              value={settings.cepCustomParams}
              onChange={handleChange}
              name="cepCustomParams"
              size="small"
              fullWidth
              multiline
              rows={2}
              disabled={!settings.cepApiEnabled}
            />
          </SettingField>
        )}
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Usar Cache" 
          tooltip="Armazenar resultados em cache para reduzir o número de requisições."
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.cepUseCache}
                  onChange={handleChange}
                  name="cepUseCache"
                  color="primary"
                />
              }
              label="Ativado"
            />
            {settings.cepUseCache && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Duração:
                </Typography>
                <TextField
                  value={settings.cepCacheDuration}
                  onChange={handleChange}
                  name="cepCacheDuration"
                  type="number"
                  size="small"
                  sx={{ width: 70 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">dias</InputAdornment>,
                  }}
                />
              </Box>
            )}
          </Box>
        </SettingField>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleTestConnection('CEP')}
            disabled={!settings.cepApiEnabled || loading}
            sx={{ mr: 1 }}
          >
            Testar Conexão
          </Button>
        </Box>
      </SettingSection>
      
      {/* Notificações */}
      <SettingSection
        title="Provedores de Notificações"
        description="Configure os provedores para envio de notificações."
        icon={<NotificationIcon />}
      >
        {/* Email */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          <EmailIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
          Provedor de Email
        </Typography>
        
        <SettingField 
          label="Email Ativo" 
          tooltip="Ativar ou desativar notificações por email."
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailEnabled}
                  onChange={handleChange}
                  name="emailEnabled"
                  color="primary"
                />
              }
              label="Ativado"
            />
            <ConnectionStatus 
              connected={connections.emailConnected} 
              lastSync={connections.emailLastSync} 
            />
          </Box>
        </SettingField>
        
        <SettingField 
          label="Provedor de Email" 
          tooltip="Serviço utilizado para envio de emails."
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={settings.emailProvider}
              onChange={handleSelectChange as any}
              name="emailProvider"
              disabled={!settings.emailEnabled}
            >
              <MenuItem value="smtp">SMTP Próprio</MenuItem>
              <MenuItem value="sendgrid">SendGrid</MenuItem>
              <MenuItem value="mailchimp">Mailchimp</MenuItem>
              <MenuItem value="aws">Amazon SES</MenuItem>
              <MenuItem value="postmark">Postmark</MenuItem>
              <MenuItem value="mandrill">Mandrill</MenuItem>
              <MenuItem value="sparkpost">SparkPost</MenuItem>
              <MenuItem value="mailgun">Mailgun</MenuItem>
              <MenuItem value="sendinblue">Sendinblue</MenuItem>
              <MenuItem value="custom">Personalizado</MenuItem>
            </Select>
          </FormControl>
        </SettingField>
        
        {settings.emailProvider === 'custom' ? (
          <>
            <SettingField 
              label="Nome do Provedor" 
              tooltip="Nome do provedor personalizado."
            >
              <TextField
                placeholder="Ex: MailProvider XYZ"
                onChange={handleChange}
                name="emailCustomProviderName"
                size="small"
                fullWidth
                disabled={!settings.emailEnabled}
              />
            </SettingField>
            
            <SettingField 
              label="URL da API" 
              tooltip="URL base da API do provedor."
            >
              <TextField
                placeholder="Ex: https://api.provedor.com/v1"
                onChange={handleChange}
                name="emailCustomApiUrl"
                size="small"
                fullWidth
                disabled={!settings.emailEnabled}
              />
            </SettingField>
            
            <SettingField 
              label="Chave de API" 
              tooltip="Chave para autenticação no provedor personalizado."
            >
              <TextField
                type="password"
                onChange={handleChange}
                name="emailCustomApiKey"
                size="small"
                fullWidth
                disabled={!settings.emailEnabled}
              />
            </SettingField>
            
            <SettingField 
              label="Formato de Autenticação" 
              tooltip="Como a chave de API deve ser enviada."
            >
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  defaultValue="header"
                  onChange={handleSelectChange as any}
                  name="emailCustomAuthFormat"
                  disabled={!settings.emailEnabled}
                >
                  <MenuItem value="header">Cabeçalho de Autenticação</MenuItem>
                  <MenuItem value="bearer">Bearer Token</MenuItem>
                  <MenuItem value="basic">Basic Auth</MenuItem>
                  <MenuItem value="query">Parâmetro de Query</MenuItem>
                  <MenuItem value="body">Corpo da Requisição</MenuItem>
                </Select>
              </FormControl>
            </SettingField>
            
            <SettingField 
              label="Parâmetros Adicionais" 
              tooltip="Parâmetros adicionais em formato JSON."
            >
              <TextField
                placeholder='Ex: {"region": "us-east-1", "version": "2.0"}'
                onChange={handleChange}
                name="emailCustomParams"
                size="small"
                fullWidth
                multiline
                rows={3}
                disabled={!settings.emailEnabled}
              />
            </SettingField>
          </>
        ) : settings.emailProvider === 'smtp' ? (
          <>
            <SettingField 
              label="Servidor SMTP" 
              tooltip="Endereço do servidor SMTP."
            >
              <TextField
                value={settings.emailSmtpServer}
                onChange={handleChange}
                name="emailSmtpServer"
                size="small"
                fullWidth
                disabled={!settings.emailEnabled}
                placeholder="smtp.empresa.com.br"
              />
            </SettingField>
            
            <SettingField 
              label="Porta SMTP" 
              tooltip="Porta do servidor SMTP."
            >
              <TextField
                value={settings.emailSmtpPort}
                onChange={handleChange}
                name="emailSmtpPort"
                type="number"
                size="small"
                sx={{ width: 100 }}
                disabled={!settings.emailEnabled}
                placeholder="587"
              />
            </SettingField>
            
            <SettingField 
              label="Usuário SMTP" 
              tooltip="Nome de usuário para autenticação no servidor SMTP."
            >
              <TextField
                value={settings.emailSmtpUsername}
                onChange={handleChange}
                name="emailSmtpUsername"
                size="small"
                fullWidth
                disabled={!settings.emailEnabled}
              />
            </SettingField>
            
            <SettingField 
              label="Senha SMTP" 
              tooltip="Senha para autenticação no servidor SMTP."
            >
              <TextField
                value={settings.emailSmtpPassword}
                onChange={handleChange}
                name="emailSmtpPassword"
                type="password"
                size="small"
                fullWidth
                disabled={!settings.emailEnabled}
              />
            </SettingField>
            
            <SettingField 
              label="Segurança" 
              tooltip="Tipo de segurança para conexão SMTP."
            >
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={settings.emailSmtpSecurity}
                  onChange={handleSelectChange as any}
                  name="emailSmtpSecurity"
                  disabled={!settings.emailEnabled}
                >
                  <MenuItem value="none">Nenhuma</MenuItem>
                  <MenuItem value="ssl">SSL</MenuItem>
                  <MenuItem value="tls">TLS</MenuItem>
                </Select>
              </FormControl>
            </SettingField>
          </>
        ) : (
          <SettingField 
            label="Chave de API" 
            tooltip="Chave para autenticação no provedor de email."
          >
            <TextField
              value={settings.emailApiKey}
              onChange={handleChange}
              name="emailApiKey"
              type="password"
              size="small"
              fullWidth
              disabled={!settings.emailEnabled}
            />
          </SettingField>
        )}
        
        <SettingField 
          label="Email de Origem" 
          tooltip="Endereço de email que aparecerá como remetente."
        >
          <TextField
            value={settings.emailFromAddress}
            onChange={handleChange}
            name="emailFromAddress"
            size="small"
            fullWidth
            disabled={!settings.emailEnabled}
          />
        </SettingField>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleTestConnection('Email')}
            disabled={!settings.emailEnabled || loading}
            sx={{ mr: 1 }}
          >
            Testar Conexão
          </Button>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* SMS */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          <SmsIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
          Provedor de SMS
        </Typography>
        
        <SettingField 
          label="SMS Ativo" 
          tooltip="Ativar ou desativar notificações por SMS."
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.smsEnabled}
                  onChange={handleChange}
                  name="smsEnabled"
                  color="primary"
                />
              }
              label="Ativado"
            />
            <ConnectionStatus 
              connected={connections.smsConnected} 
              lastSync={connections.smsLastSync} 
            />
          </Box>
        </SettingField>
        
        <SettingField 
          label="Provedor de SMS" 
          tooltip="Serviço utilizado para envio de SMS."
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={settings.smsProvider}
              onChange={handleSelectChange as any}
              name="smsProvider"
              disabled={!settings.smsEnabled}
            >
              <MenuItem value="twilio">Twilio</MenuItem>
              <MenuItem value="zenvia">Zenvia</MenuItem>
              <MenuItem value="totalvoice">TotalVoice</MenuItem>
              <MenuItem value="infobip">Infobip</MenuItem>
              <MenuItem value="plivo">Plivo</MenuItem>
              <MenuItem value="messagebird">MessageBird</MenuItem>
              <MenuItem value="clicksend">ClickSend</MenuItem>
              <MenuItem value="vonage">Vonage (Nexmo)</MenuItem>
              <MenuItem value="custom">Personalizado</MenuItem>
            </Select>
          </FormControl>
        </SettingField>
        
        {settings.smsProvider === 'custom' ? (
          <>
            <SettingField 
              label="Nome do Provedor" 
              tooltip="Nome do provedor personalizado."
            >
              <TextField
                placeholder="Ex: SMS Provider XYZ"
                onChange={handleChange}
                name="smsCustomProviderName"
                size="small"
                fullWidth
                disabled={!settings.smsEnabled}
              />
            </SettingField>
            
            <SettingField 
              label="URL da API" 
              tooltip="URL base da API do provedor."
            >
              <TextField
                placeholder="Ex: https://api.smsprovider.com/v1"
                onChange={handleChange}
                name="smsCustomApiUrl"
                size="small"
                fullWidth
                disabled={!settings.smsEnabled}
              />
            </SettingField>
            
            <SettingField 
              label="Chave de API" 
              tooltip="Chave para autenticação no provedor personalizado."
            >
              <TextField
                type="password"
                onChange={handleChange}
                name="smsCustomApiKey"
                size="small"
                fullWidth
                disabled={!settings.smsEnabled}
              />
            </SettingField>
            
            <SettingField 
              label="Formato de Autenticação" 
              tooltip="Como a chave de API deve ser enviada."
            >
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  defaultValue="header"
                  onChange={handleSelectChange as any}
                  name="smsCustomAuthFormat"
                  disabled={!settings.smsEnabled}
                >
                  <MenuItem value="header">Cabeçalho de Autenticação</MenuItem>
                  <MenuItem value="bearer">Bearer Token</MenuItem>
                  <MenuItem value="basic">Basic Auth</MenuItem>
                  <MenuItem value="query">Parâmetro de Query</MenuItem>
                  <MenuItem value="body">Corpo da Requisição</MenuItem>
                </Select>
              </FormControl>
            </SettingField>
            
            <SettingField 
              label="Parâmetros Adicionais" 
              tooltip="Parâmetros adicionais em formato JSON."
            >
              <TextField
                placeholder='Ex: {"region": "us-east-1", "channel": "transactional"}'
                onChange={handleChange}
                name="smsCustomParams"
                size="small"
                fullWidth
                multiline
                rows={3}
                disabled={!settings.smsEnabled}
              />
            </SettingField>
          </>
        ) : (
          <SettingField 
            label="Chave de API" 
            tooltip="Chave para autenticação no provedor de SMS."
          >
            <TextField
              value={settings.smsApiKey}
              onChange={handleChange}
              name="smsApiKey"
              type="password"
              size="small"
              fullWidth
              disabled={!settings.smsEnabled}
            />
          </SettingField>
        )}
        
        <SettingField 
          label="Número de Origem" 
          tooltip="Número que aparecerá como remetente."
        >
          <TextField
            value={settings.smsFromNumber}
            onChange={handleChange}
            name="smsFromNumber"
            size="small"
            fullWidth
            disabled={!settings.smsEnabled}
          />
        </SettingField>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleTestConnection('SMS')}
            disabled={!settings.smsEnabled || loading}
            sx={{ mr: 1 }}
          >
            Testar Conexão
          </Button>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Webhook */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          <WebhookIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
          Webhook
        </Typography>
        
        <SettingField 
          label="Webhook Ativo" 
          tooltip="Ativar ou desativar notificações por webhook."
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.webhookEnabled}
                  onChange={handleChange}
                  name="webhookEnabled"
                  color="primary"
                />
              }
              label="Ativado"
            />
            <ConnectionStatus 
              connected={connections.webhookConnected} 
              lastSync={connections.webhookLastSync} 
            />
          </Box>
        </SettingField>
        
        <SettingField 
          label="URL do Webhook" 
          tooltip="URL para onde as notificações serão enviadas."
        >
          <TextField
            value={settings.webhookUrl}
            onChange={handleChange}
            name="webhookUrl"
            size="small"
            fullWidth
            disabled={!settings.webhookEnabled}
          />
        </SettingField>
        
        <SettingField 
          label="Segredo do Webhook" 
          tooltip="Chave secreta para autenticação do webhook."
        >
          <TextField
            value={settings.webhookSecret}
            onChange={handleChange}
            name="webhookSecret"
            type="password"
            size="small"
            fullWidth
            disabled={!settings.webhookEnabled}
          />
        </SettingField>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleTestConnection('Webhook')}
            disabled={!settings.webhookEnabled || loading}
            sx={{ mr: 1 }}
          >
            Testar Conexão
          </Button>
        </Box>
      </SettingSection>
      
      {/* Configurações de Notificações */}
      <SettingSection
        title="Configurações de Notificações"
        description="Configure quando e como as notificações serão enviadas."
        icon={<SettingsIcon />}
      >
        <SettingField 
          label="Notificar ao Receber Nova Fatura" 
          tooltip="Enviar notificação quando uma nova fatura for adicionada."
        >
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifyOnNewInvoice}
                onChange={handleChange}
                name="notifyOnNewInvoice"
                color="primary"
              />
            }
            label="Ativado"
          />
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Notificar Antes do Vencimento" 
          tooltip="Enviar notificação antes do vencimento da fatura."
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifyOnPaymentDue}
                  onChange={handleChange}
                  name="notifyOnPaymentDue"
                  color="primary"
                />
              }
              label="Ativado"
            />
            <TextField
              value={settings.notifyDaysBeforeDue}
              onChange={handleChange}
              name="notifyDaysBeforeDue"
              type="number"
              size="small"
              sx={{ width: 80, ml: 2 }}
              disabled={!settings.notifyOnPaymentDue}
              InputProps={{
                endAdornment: <InputAdornment position="end">dias</InputAdornment>,
              }}
            />
          </Box>
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Notificar ao Receber Pagamento" 
          tooltip="Enviar notificação quando um pagamento for recebido."
        >
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifyOnPaymentReceived}
                onChange={handleChange}
                name="notifyOnPaymentReceived"
                color="primary"
              />
            }
            label="Ativado"
          />
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Notificar Pagamento Atrasado" 
          tooltip="Enviar notificação quando um pagamento estiver atrasado."
        >
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifyOnLatePayment}
                onChange={handleChange}
                name="notifyOnLatePayment"
                color="primary"
              />
            }
            label="Ativado"
          />
        </SettingField>
        
        <Divider sx={{ my: 1 }} />
        
        <SettingField 
          label="Template de Notificação" 
          tooltip="Modelo de notificação a ser utilizado."
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={settings.notificationTemplate}
              onChange={handleSelectChange as any}
              name="notificationTemplate"
            >
              <MenuItem value="default">Padrão</MenuItem>
              <MenuItem value="minimal">Minimalista</MenuItem>
              <MenuItem value="detailed">Detalhado</MenuItem>
              <MenuItem value="custom">Personalizado</MenuItem>
            </Select>
          </FormControl>
        </SettingField>
      </SettingSection>
      
      {/* Botão de salvar */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSaveSettings}
          disabled={loading}
          sx={{
            borderRadius: '10px',
            fontWeight: 600,
            boxShadow: '0 4px 10px rgba(0, 122, 255, 0.3)',
            px: 3
          }}
        >
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </Box>
    </Box>
  );
};

export default IntegrationsTab;

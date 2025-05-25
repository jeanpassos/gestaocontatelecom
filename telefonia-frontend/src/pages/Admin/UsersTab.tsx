import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  FormHelperText,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel,
  useTheme,
  SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  VpnKey as VpnKeyIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  BusinessCenter as BusinessIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  CreditCard as CreditCardIcon,
  PhotoCamera as PhotoCameraIcon,
  Upload as UploadIcon,
  CameraAlt as CameraAltIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import UserService, { User, CreateUserDto, UpdateUserDto } from '../../services/user.service';
import CompanyService, { Company } from '../../services/company.service';
import { useSnackbar } from 'notistack';

// Componente para exibir status de usuário
const UserStatusChip = ({ active }: { active: boolean }) => {
  const theme = useTheme();
  
  return (
    <Chip
      label={active ? 'Ativo' : 'Inativo'}
      size="small"
      icon={active ? <CheckIcon /> : <CloseIcon />}
      color={active ? 'success' : 'default'}
      sx={{
        fontWeight: 500,
        backgroundColor: active ? 'rgba(46, 204, 113, 0.1)' : 'rgba(189, 195, 199, 0.1)',
        color: active ? theme.palette.success.main : theme.palette.text.secondary,
        '& .MuiChip-icon': {
          color: 'inherit'
        }
      }}
    />
  );
};

// Componente para exibir função do usuário
const UserRoleChip = ({ role }: { role: string }) => {
  const theme = useTheme();
  
  const getRoleConfig = () => {
    switch (role) {
      case 'admin':
        return {
          label: 'Administrador',
          color: theme.palette.error.main,
          bgColor: 'rgba(255, 59, 48, 0.1)'
        };
      case 'manager':
        return {
          label: 'Gerente',
          color: theme.palette.primary.main,
          bgColor: 'rgba(0, 122, 255, 0.1)'
        };
      case 'user':
        return {
          label: 'Usuário',
          color: theme.palette.info.main,
          bgColor: 'rgba(52, 152, 219, 0.1)'
        };
      default:
        return {
          label: role,
          color: theme.palette.text.secondary,
          bgColor: 'rgba(0, 0, 0, 0.05)'
        };
    }
  };
  
  const { label, color, bgColor } = getRoleConfig();
  
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 500,
        backgroundColor: bgColor,
        color: color,
        borderRadius: '6px'
      }}
    />
  );
};

// Modal de Usuário (Criar/Editar)
interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (userData: CreateUserDto | UpdateUserDto, isNewUser: boolean) => void;
  user?: User;
  isLoading: boolean;
}

const UserModal: React.FC<UserModalProps> = ({ 
  open, 
  onClose, 
  onSave, 
  user, 
  isLoading 
}) => {
  const isNewUser = !user;
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  // Usamos um tipo mais amplo para o formData com todas as propriedades possíveis
  const [formData, setFormData] = useState<CreateUserDto & UpdateUserDto>({
    email: '',
    password: '',
    name: '',
    role: 'user',
    companyId: '',
    active: true,
    phone: '',
    isWhatsapp: false,
    cpf: '',
    profilePicture: ''
  });
  
  // Estados para upload de imagem
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialFormState, setInitialFormState] = useState(formData);

  // Carregar empresas para o select
  useEffect(() => {
    const fetchCompanies = async () => {
      setCompaniesLoading(true);
      try {
        const data = await CompanyService.getAll();
        setCompanies(data);
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
      } finally {
        setCompaniesLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Inicializar formulário com dados do usuário se estiver editando
  useEffect(() => {
    if (user) {
      // Para edição, precisamos incluir um password vazio para satisfazer o tipo
      const userFormData = {
        email: user.email,
        name: user.name || '',
        role: user.role,
        companyId: user.companyId || '',
        active: user.active,
        // Novos campos
        phone: user.phone || '',
        isWhatsapp: user.isWhatsapp || false,
        cpf: user.cpf || '',
        profilePicture: user.profilePicture || '',
        // Adicionando password vazio para satisfazer o tipo CreateUserDto & UpdateUserDto
        password: ''
      };
      setFormData(userFormData);
      setInitialFormState(userFormData);
    } else {
      const newUserData = {
        email: '',
        password: '',
        name: '',
        role: 'user' as const,
        companyId: '',
        active: true,
        phone: '',
        isWhatsapp: false,
        cpf: '',
        profilePicture: ''
      };
      setFormData(newUserData);
      setInitialFormState(newUserData);
    }
  }, [user]);

  // Validar email
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validar formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'E-mail inválido';
      isValid = false;
    }

    if (isNewUser && !formData.password) {
      newErrors.password = 'Senha é obrigatória para novos usuários';
      isValid = false;
    }

    if (isNewUser && (formData as CreateUserDto).password && (formData as CreateUserDto).password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }
    
    // Validação de CPF
    if (formData.cpf) {
      const cpfNumbers = formData.cpf.replace(/\D/g, '');
      if (cpfNumbers.length !== 11) {
        newErrors.cpf = 'CPF deve conter 11 dígitos';
        isValid = false;
      }
    }
    
    // Validação de telefone
    if (formData.phone) {
      const phoneNumbers = formData.phone.replace(/\D/g, '');
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        newErrors.phone = 'Telefone deve conter 10 ou 11 dígitos';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Manipular alterações nos campos de texto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));

    // Limpar erro do campo
    if (errors[name as string]) {
      setErrors(prev => ({
        ...prev,
        [name as string]: ''
      }));
    }
  };
  
  // Manipular alterações nos campos Select
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manipular envio do formulário
  const handleSubmit = () => {
    if (validateForm()) {
      // Separar os dados conforme o tipo de operação (create ou update)
      if (isNewUser) {
        // Para novo usuário, precisamos de CreateUserDto (com senha obrigatória)
        const createData: CreateUserDto = {
          email: formData.email,
          password: formData.password,
          name: formData.name || undefined,
          role: formData.role,
          companyId: formData.companyId || undefined,
          // Novos campos
          phone: formData.phone || undefined,
          isWhatsapp: formData.isWhatsapp,
          cpf: formData.cpf || undefined,
          profilePicture: formData.profilePicture || undefined
        };
        onSave(createData, true);
      } else {
        // Para atualização, usamos UpdateUserDto (sem senha)
        const updateData: UpdateUserDto = {
          email: formData.email,
          name: formData.name || undefined,
          role: formData.role,
          companyId: formData.companyId || undefined,
          active: formData.active,
          // Novos campos
          phone: formData.phone || undefined,
          isWhatsapp: formData.isWhatsapp,
          cpf: formData.cpf || undefined,
          profilePicture: formData.profilePicture || undefined
        };
        onSave(updateData, false);
      }
    }
  };

  // Funções para manipular upload de imagens e captura de webcam
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profilePicture: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Removendo funcionalidade de webcam para simplificar

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Aplica a máscara de CPF (XXX.XXX.XXX-XX)
    if (numericValue.length <= 3) {
      return numericValue;
    } else if (numericValue.length <= 6) {
      return `${numericValue.slice(0, 3)}.${numericValue.slice(3)}`;
    } else if (numericValue.length <= 9) {
      return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6)}`;
    } else {
      return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6, 9)}-${numericValue.slice(9, 11)}`;
    }
  };

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Aplica a máscara de telefone ((XX) XXXXX-XXXX)
    if (numericValue.length <= 2) {
      return numericValue;
    } else if (numericValue.length <= 7) {
      return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2)}`;
    } else {
      return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 7)}-${numericValue.slice(7, 11)}`;
    }
  };

  // Manipulador para campos formatados (CPF e telefone)
  const handleFormattedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'phone') {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Verificar se o formulário foi alterado
  const isFormChanged = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormState);
  };

  return (
    <Dialog 
      open={open} 
      onClose={isLoading ? undefined : onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {isNewUser ? 'Novo Usuário' : 'Editar Usuário'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0 }}>
          {/* Foto de Perfil */}
          <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 150,
                height: 150,
                borderRadius: '50%',
                border: '2px dashed #ccc',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                mb: 2,
                position: 'relative',
                backgroundColor: '#f5f5f5'
              }}
            >
              {formData.profilePicture ? (
                <img 
                  src={formData.profilePicture} 
                  alt="Foto de perfil" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <PersonIcon sx={{ fontSize: 80, color: '#aaa' }} />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                Upload
              </Button>
              {/* Botão de webcam removido para simplificar */}
              {formData.profilePicture && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => setFormData(prev => ({ ...prev, profilePicture: '' }))}
                  disabled={isLoading}
                >
                  Remover
                </Button>
              )}
            </Box>
            
            {/* Modal da Webcam removido para simplificar */}
          </Grid>
          
          {/* Campos de dados */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="E-mail"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isLoading || !isNewUser}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* CPF */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="CPF"
              name="cpf"
              value={formData.cpf}
              onChange={handleFormattedChange}
              error={!!errors.cpf}
              helperText={errors.cpf}
              disabled={isLoading}
              placeholder="000.000.000-00"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CreditCardIcon color="action" />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* Telefone */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefone"
              name="phone"
              value={formData.phone}
              onChange={handleFormattedChange}
              error={!!errors.phone}
              helperText={errors.phone}
              disabled={isLoading}
              placeholder="(00) 00000-0000"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* WhatsApp */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isWhatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, isWhatsapp: e.target.checked }))}
                  color="success"
                  disabled={!formData.phone || isLoading}
                />
              }
              label={(
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WhatsAppIcon sx={{ mr: 1, color: formData.isWhatsapp ? '#25D366' : 'text.disabled' }} />
                  <Typography>WhatsApp</Typography>
                </Box>
              )}
            />
          </Grid>
          
          {isNewUser && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="password"
                label="Senha"
                name="password"
                value={(formData as CreateUserDto).password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKeyIcon color="action" />
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
          )}
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.role} sx={{ mb: 2 }}>
              <InputLabel>Função</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleSelectChange}
                disabled={isLoading}
                label="Função"
              >
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="manager">Gerente</MenuItem>
                <MenuItem value="user">Usuário</MenuItem>
              </Select>
              {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Empresa</InputLabel>
              <Select
                name="companyId"
                value={formData.companyId || ''}
                onChange={handleSelectChange}
                disabled={isLoading || companiesLoading}
                label="Empresa"
              >
                <MenuItem value="">Nenhuma</MenuItem>
                {companies.map(company => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.corporateName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {!isNewUser && (
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    color="success"
                  />
                }
                label="Usuário Ativo"
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || !isFormChanged()}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Modal de Redefinir Senha
interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  user?: User;
  onReset: (userId: string) => void;
  isLoading: boolean;
  tempPassword?: string;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  onClose,
  user,
  onReset,
  isLoading,
  tempPassword
}) => {
  if (!user) return null;

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose}>
      <DialogTitle>Redefinir Senha</DialogTitle>
      <DialogContent>
        {!tempPassword ? (
          <>
            <Typography variant="body1" gutterBottom>
              Você está prestes a redefinir a senha do usuário:
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              {user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Uma nova senha temporária será gerada. O usuário precisará alterá-la no primeiro acesso.
            </Typography>
          </>
        ) : (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              Senha redefinida com sucesso
            </Alert>
            <Typography variant="body1" gutterBottom>
              A senha temporária para {user.email} é:
            </Typography>
            <Paper
              sx={{
                p: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '1.2rem',
                textAlign: 'center',
                mb: 2
              }}
            >
              {tempPassword}
            </Paper>
            <Alert severity="warning">
              Esta senha só será exibida uma vez. Certifique-se de copiá-la e enviá-la ao usuário por um canal seguro.
            </Alert>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={isLoading}
        >
          {tempPassword ? 'Fechar' : 'Cancelar'}
        </Button>
        {!tempPassword && (
          <Button
            variant="contained"
            color="warning"
            onClick={() => onReset(user.id)}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <VpnKeyIcon />}
          >
            {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// Componente Principal da Tab de Usuários
const UsersTab: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  
  // Modais
  const [userModal, setUserModal] = useState<{
    open: boolean;
    user?: User;
  }>({ open: false });
  const [resetPasswordModal, setResetPasswordModal] = useState<{
    open: boolean;
    user?: User;
    tempPassword?: string;
  }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    user?: User;
  }>({ open: false });
  const [actionLoading, setActionLoading] = useState(false);

  // Carregar usuários
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await UserService.getAll({
        search: search || undefined,
        role: roleFilter || undefined,
        active: !showInactive ? true : undefined
      });
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      enqueueSnackbar('Erro ao carregar usuários', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Carregar usuários quando o componente for montado
  useEffect(() => {
    loadUsers();
  }, [roleFilter, showInactive]);

  // Criar ou atualizar usuário
  const handleSaveUser = async (userData: CreateUserDto | UpdateUserDto, isNewUser: boolean) => {
    setActionLoading(true);
    try {
      if (isNewUser) {
        await UserService.create(userData as CreateUserDto);
        enqueueSnackbar('Usuário criado com sucesso', { variant: 'success' });
      } else if (userModal.user) {
        await UserService.update(userModal.user.id, userData as UpdateUserDto);
        enqueueSnackbar('Usuário atualizado com sucesso', { variant: 'success' });
      }
      setUserModal({ open: false });
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      enqueueSnackbar(
        `Erro ao ${isNewUser ? 'criar' : 'atualizar'} usuário: ${error.response?.data?.message || error.message}`,
        { variant: 'error' }
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Redefinir senha
  const handleResetPassword = async (userId: string) => {
    setActionLoading(true);
    try {
      const result = await UserService.resetPassword(userId);
      setResetPasswordModal(prev => ({
        ...prev,
        tempPassword: result.temporaryPassword
      }));
      enqueueSnackbar('Senha redefinida com sucesso', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      enqueueSnackbar('Erro ao redefinir senha', { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Ativar/Desativar usuário
  const handleToggleActive = async (user: User) => {
    setActionLoading(true);
    try {
      if (user.active) {
        await UserService.deactivate(user.id);
        enqueueSnackbar('Usuário desativado com sucesso', { variant: 'success' });
      } else {
        await UserService.activate(user.id);
        enqueueSnackbar('Usuário ativado com sucesso', { variant: 'success' });
      }
      loadUsers();
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      enqueueSnackbar('Erro ao alterar status do usuário', { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Exibir o conteúdo da tab
  return (
    <Box>
      {/* Cabeçalho e controles */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Gerenciamento de Usuários
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUserModal({ open: true })}
          sx={{
            borderRadius: '10px',
            fontWeight: 600,
            px: 3,
            boxShadow: '0 4px 10px rgba(0, 122, 255, 0.3)',
          }}
        >
          Novo Usuário
        </Button>
      </Box>

      {/* Filtros */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar por email ou nome"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                )
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Função</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as string)}
                label="Função"
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="manager">Gerente</MenuItem>
                <MenuItem value="user">Usuário</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  color="primary"
                />
              }
              label="Mostrar inativos"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearch('');
                  setRoleFilter('');
                  setShowInactive(false);
                }}
              >
                Limpar
              </Button>
              <Button
                variant="contained"
                onClick={loadUsers}
                sx={{
                  backgroundColor: '#1976D2',
                  '&:hover': {
                    backgroundColor: '#1565C0'
                  },
                  transition: 'background-color 0.2s ease-in-out',
                  borderRadius: '10px',
                  fontWeight: 500
                }}
              >
                <SearchIcon sx={{ mr: 1 }} fontSize="small" />
                Buscar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabela de usuários */}
      <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
              <TableCell sx={{ fontWeight: 600, width: 60 }}>Foto</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>E-mail / Nome</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Telefone / CPF</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Função</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Empresa</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Nenhum usuário encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow 
                  key={user.id}
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                    ...(user.active ? {} : { backgroundColor: 'rgba(0, 0, 0, 0.02)' })
                  }}
                >
                  {/* Foto de perfil */}
                  <TableCell>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#f5f5f5'
                      }}
                    >
                      {user.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt={user.name || user.email} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <PersonIcon sx={{ color: '#aaa' }} />
                      )}
                    </Box>
                  </TableCell>
                  
                  {/* Email e Nome */}
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {user.email}
                      </Typography>
                      {user.name && (
                        <Typography variant="body2" color="text.secondary">
                          {user.name}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  
                  {/* Telefone e CPF */}
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      {user.phone ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>
                            {user.phone}
                          </Typography>
                          {user.isWhatsapp && (
                            <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                      {user.cpf && (
                        <Typography variant="body2" color="text.secondary">
                          {user.cpf}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  
                  {/* Função */}
                  <TableCell>
                    <UserRoleChip role={user.role} />
                  </TableCell>
                  
                  {/* Empresa */}
                  <TableCell>
                    {user.company?.corporateName || '-'}
                  </TableCell>
                  
                  {/* Status */}
                  <TableCell>
                    <UserStatusChip active={user.active} />
                  </TableCell>
                  
                  {/* Ações */}
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      {/* Roxo para Redefinir Senha - representa segurança, proteção */}
                      <Tooltip title="Redefinir Senha">
                        <IconButton
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(106, 90, 205, 0.08)', 
                            '&:hover': { backgroundColor: 'rgba(106, 90, 205, 0.12)' },
                            '&.Mui-disabled': { opacity: 0.5 }
                          }}
                          onClick={() => setResetPasswordModal({ open: true, user })}
                          disabled={actionLoading}
                        >
                          <VpnKeyIcon fontSize="small" sx={{ color: '#6A5ACD' }} />
                        </IconButton>
                      </Tooltip>
                      
                      {/* Laranja para Editar - representa modificação, atenção */}
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(237, 108, 2, 0.08)', 
                            '&:hover': { backgroundColor: 'rgba(237, 108, 2, 0.12)' },
                            '&.Mui-disabled': { opacity: 0.5 }
                          }}
                          onClick={() => setUserModal({ open: true, user })}
                          disabled={actionLoading}
                        >
                          <EditIcon fontSize="small" sx={{ color: '#ED6C02' }} />
                        </IconButton>
                      </Tooltip>
                      
                      {/* Vermelho/Verde para Desativar/Ativar - representa ações opostas */}
                      <Tooltip title={user.active ? "Desativar" : "Ativar"}>
                        <IconButton
                          size="small"
                          sx={{ 
                            backgroundColor: user.active 
                              ? 'rgba(211, 47, 47, 0.08)' 
                              : 'rgba(46, 125, 50, 0.08)', 
                            '&:hover': { 
                              backgroundColor: user.active 
                                ? 'rgba(211, 47, 47, 0.12)' 
                                : 'rgba(46, 125, 50, 0.12)' 
                            },
                            '&.Mui-disabled': { opacity: 0.5 }
                          }}
                          onClick={() => handleToggleActive(user)}
                          disabled={actionLoading}
                        >
                          {user.active 
                            ? <CloseIcon fontSize="small" sx={{ color: '#D32F2F' }} /> 
                            : <CheckIcon fontSize="small" sx={{ color: '#2E7D32' }} />}
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

      {/* Modal de Criar/Editar Usuário */}
      <UserModal
        open={userModal.open}
        onClose={() => setUserModal({ open: false })}
        onSave={handleSaveUser}
        user={userModal.user}
        isLoading={actionLoading}
      />

      {/* Modal de Redefinir Senha */}
      <ResetPasswordModal
        open={resetPasswordModal.open}
        onClose={() => setResetPasswordModal({ open: false, tempPassword: undefined })}
        user={resetPasswordModal.user}
        onReset={handleResetPassword}
        isLoading={actionLoading}
        tempPassword={resetPasswordModal.tempPassword}
      />
    </Box>
  );
};

export default UsersTab;

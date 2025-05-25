import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  Avatar,
  Typography,
  IconButton,
  CircularProgress,
  Divider,
  Alert
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  avatarUrl: string;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatarUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Carregar dados do usuário quando o modal abrir
  useEffect(() => {
    if (open && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        avatarUrl: user.avatarUrl || ''
      });
      setAvatarPreview(user.avatarUrl || '');
    }
  }, [open, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    // Validar email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage({ type: 'error', text: 'Email inválido' });
      return false;
    }
    
    // Validar senha
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setMessage({ type: 'error', text: 'Informe a senha atual para definir uma nova senha' });
        return false;
      }
      
      if (formData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' });
        return false;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'As senhas não coincidem' });
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      // Preparar os dados para atualização
      const profileData: any = {};
      
      // Incluir apenas os campos que foram alterados
      if (formData.name !== user?.name) profileData.name = formData.name;
      if (formData.email !== user?.email) profileData.email = formData.email;
      if (formData.phone !== user?.phone) profileData.phone = formData.phone;
      
      // Processar alteração de senha, se fornecida
      if (formData.newPassword && formData.currentPassword) {
        profileData.currentPassword = formData.currentPassword;
        profileData.newPassword = formData.newPassword;
      }
      
      // Processar o upload de avatar (em uma implementação real, você enviaria o arquivo para o servidor)
      if (avatarFile) {
        // Simular o upload e obter a URL
        // Em uma implementação real, você enviaria o arquivo para o servidor e receberia a URL
        profileData.avatarUrl = avatarPreview;
      }
      
      // Chamar o serviço de autenticação para atualizar o perfil
      await updateProfile(profileData);
      
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      
      // Fechar o modal após um breve atraso
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erro ao atualizar perfil. Tente novamente.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Editar Perfil</Typography>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose} 
          disabled={loading}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {message && (
            <Alert 
              severity={message.type} 
              sx={{ mb: 2 }}
              onClose={() => setMessage(null)}
            >
              {message.text}
            </Alert>
          )}
          
          {/* Avatar */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={avatarPreview}
                sx={{ 
                  width: 100, 
                  height: 100,
                  border: '3px solid #f0f0f0',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              >
                {formData.name.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: -5,
                  right: -5,
                  backgroundColor: 'white',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <PhotoCameraIcon />
              </IconButton>
            </Box>
          </Box>
          
          <Grid container spacing={2}>
            {/* Informações básicas */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Informações Pessoais
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                variant="outlined"
                disabled={loading}
              />
            </Grid>
            
            {/* Alterar senha */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Alterar Senha
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Senha Atual"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                variant="outlined"
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nova Senha"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                variant="outlined"
                disabled={loading}
                helperText="Mínimo de 6 caracteres"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirmar Nova Senha"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                variant="outlined"
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileModal;

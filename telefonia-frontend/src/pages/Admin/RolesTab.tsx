import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  useTheme,
  Avatar
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ManagerIcon,
  Person as UserIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Support as ConsultantIcon
} from '@mui/icons-material';

// Componente de permissões para cada perfil
const PermissionItem = ({ 
  name, 
  admin = false, 
  manager = false, 
  consultant = false,
  user = false 
}: { 
  name: string; 
  admin?: boolean; 
  manager?: boolean; 
  consultant?: boolean;
  user?: boolean; 
}) => {
  const theme = useTheme();
  
  const renderStatus = (hasAccess: boolean) => {
    return hasAccess ? (
      <CheckIcon sx={{ color: theme.palette.success.main }} />
    ) : (
      <CloseIcon sx={{ color: theme.palette.error.main }} />
    );
  };
  
  return (
    <ListItem
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&:last-child': {
          borderBottom: 'none'
        }
      }}
    >
      <ListItemText 
        primary={name}
        sx={{ flex: '1 1 30%' }}
      />
      <Box sx={{ flex: '1 1 17.5%', textAlign: 'center' }}>
        {renderStatus(admin)}
      </Box>
      <Box sx={{ flex: '1 1 17.5%', textAlign: 'center' }}>
        {renderStatus(manager)}
      </Box>
      <Box sx={{ flex: '1 1 17.5%', textAlign: 'center' }}>
        {renderStatus(consultant)}
      </Box>
      <Box sx={{ flex: '1 1 17.5%', textAlign: 'center' }}>
        {renderStatus(user)}
      </Box>
    </ListItem>
  );
};

// Componente do card de perfil
const RoleCard = ({ 
  title, 
  description, 
  icon, 
  color 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  color: string; 
}) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <Box
        sx={{
          backgroundColor: color,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          px: 3
        }}
      >
        <Avatar
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            width: 40,
            height: 40
          }}
        >
          {icon}
        </Avatar>
        <Typography
          variant="h6"
          sx={{
            ml: 2,
            color: 'white',
            fontWeight: 600
          }}
        >
          {title}
        </Typography>
      </Box>
      <CardContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Guia de Perfis de Acesso
const RolesTab: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Perfis de Acesso e Permissões
      </Typography>
      
      {/* Cards de perfis */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <RoleCard
            title="Administrador"
            description="Acesso completo ao sistema. Pode gerenciar usuários, empresas, configurações e todos os dados."
            icon={<AdminIcon />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <RoleCard
            title="Gerente"
            description="Acesso para gerenciar faturas, empresas e relatórios. Não pode alterar configurações do sistema."
            icon={<ManagerIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <RoleCard
            title="Consultor"
            description="Acesso para gerenciar contratos, documentos e clientes. Foco no acompanhamento de novos clientes."
            icon={<ConsultantIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <RoleCard
            title="Usuário"
            description="Acesso básico para visualizar e gerenciar faturas relacionadas à sua empresa."
            icon={<UserIcon />}
            color={theme.palette.info.main}
          />
        </Grid>
      </Grid>
      
      {/* Tabela de permissões */}
      <Paper
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box sx={{ p: 3, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Matriz de Permissões
          </Typography>
        </Box>
        <Divider />
        
        <Box sx={{ p: 0 }}>
          {/* Cabeçalho da tabela */}
          <Box
            sx={{
              display: 'flex',
              p: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: 'rgba(0, 0, 0, 0.01)'
            }}
          >
            <Typography sx={{ flex: '1 1 30%', fontWeight: 600 }}>
              Funcionalidade
            </Typography>
            <Typography sx={{ flex: '1 1 17.5%', textAlign: 'center', fontWeight: 600 }}>
              Administrador
            </Typography>
            <Typography sx={{ flex: '1 1 17.5%', textAlign: 'center', fontWeight: 600 }}>
              Gerente
            </Typography>
            <Typography sx={{ flex: '1 1 17.5%', textAlign: 'center', fontWeight: 600 }}>
              Consultor
            </Typography>
            <Typography sx={{ flex: '1 1 17.5%', textAlign: 'center', fontWeight: 600 }}>
              Usuário
            </Typography>
          </Box>
          
          {/* Lista de permissões */}
          <List disablePadding>
            <PermissionItem name="Visualizar Dashboard" admin={true} manager={true} consultant={true} user={true} />
            <PermissionItem name="Gerenciar Usuários" admin={true} manager={false} consultant={false} user={false} />
            <PermissionItem name="Gerenciar Contratos" admin={true} manager={true} consultant={true} user={false} />
            <PermissionItem name="Visualizar Faturas" admin={true} manager={true} consultant={true} user={true} />
            <PermissionItem name="Criar/Editar Faturas" admin={true} manager={true} consultant={false} user={false} />
            <PermissionItem name="Excluir Faturas" admin={true} manager={false} consultant={false} user={false} />
            <PermissionItem name="Upload de Faturas" admin={true} manager={true} consultant={true} user={true} />
            <PermissionItem name="Gerar Relatórios" admin={true} manager={true} consultant={false} user={false} />
            <PermissionItem name="Configurações do Sistema" admin={true} manager={false} consultant={false} user={false} />
            <PermissionItem name="Visualizar Todos os Contratos" admin={true} manager={true} consultant={true} user={false} />
            <PermissionItem name="Processar Pagamentos" admin={true} manager={true} consultant={false} user={false} />
            <PermissionItem name="Gerenciar Documentos" admin={true} manager={true} consultant={true} user={false} />
            <PermissionItem name="Acompanhar Novos Clientes" admin={true} manager={true} consultant={true} user={false} />
          </List>
        </Box>
      </Paper>
      
      {/* Informações adicionais */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Notas sobre as permissões:
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          1. <strong>Administradores</strong> têm acesso total ao sistema, incluindo configurações, usuários e todas as funcionalidades.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          2. <strong>Gerentes</strong> podem gerenciar faturas e empresas, mas não podem alterar configurações do sistema ou gerenciar usuários.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          3. <strong>Usuários</strong> têm acesso limitado e só podem ver e gerenciar suas próprias faturas, sem acesso a funcionalidades administrativas.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          4. As permissões são definidas no backend e não podem ser alteradas através da interface do usuário.
        </Typography>
      </Box>
    </Box>
  );
};

export default RolesTab;

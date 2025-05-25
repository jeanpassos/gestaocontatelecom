import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  useTheme,
  Drawer
} from '@mui/material';
import ProfileModal from '../User/ProfileModal';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Assessment as ReportIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SideMenuProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({
  mobileOpen,
  handleDrawerToggle,
  collapsed,
  toggleCollapsed
}) => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Definir a cor principal como verde
  const primaryGreen = '#008069';
  const darkGreen = '#006e58';

  // Filtrar itens de menu com base no papel do usuário
  const getMenuItems = () => {
    const baseItems = [
      { icon: <DashboardIcon />, label: 'Dashboard', path: '/dashboard' },
      { icon: <BusinessIcon />, label: 'Empresas', path: '/companies' },
      { icon: <ReceiptIcon />, label: 'Faturas', path: '/invoices' },
    ];
    
    // Adicionar relatórios apenas para admin e gerente
    if (user?.role === 'admin' || user?.role === 'manager') {
      baseItems.push({ icon: <ReportIcon />, label: 'Relatórios', path: '/reports' });
    }
    
    // Adicionar consultor para todos os perfis (exceto consultor)
    if (user?.role !== 'consultant') {
      baseItems.push({ icon: <PeopleIcon />, label: 'Consultor', path: '/consultant-dashboard' });
    }
    
    // Adicionar configurações apenas para administradores
    if (user?.role === 'admin') {
      baseItems.push({ icon: <SettingsIcon />, label: 'Configurações', path: '/admin?tab=2' });
    }
    
    return baseItems;
  };
  
  // Menu items
  const menuItems = getMenuItems();
  
  // Função para verificar se um item de menu está ativo, considerando também subpáginas
  const isMenuItemActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleOpenProfileModal = () => {
    setProfileModalOpen(true);
  };
  
  const handleCloseProfileModal = () => {
    setProfileModalOpen(false);
  };

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#e0e0e5',
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      width: collapsed ? 72 : 280,
      transition: 'width 0.3s ease'
    }}>
      {/* Cabeçalho do menu */}
      <Box sx={{ 
        p: collapsed ? 1 : 2, 
        display: 'flex', 
        alignItems: 'center',
        backgroundColor: primaryGreen,
        color: '#fff',
        justifyContent: collapsed ? 'center' : 'space-between'
      }}>
        {!collapsed && (
          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
            TelecomBill
          </Typography>
        )}
        <IconButton 
          color="inherit" 
          onClick={toggleCollapsed}
          sx={{ ...(collapsed && { margin: 0 }) }}
        >
          {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      {/* Lista de navegação */}
      <List sx={{ flex: 1, px: collapsed ? 0.5 : 1, backgroundColor: '#d0d0d8', borderRadius: '0 0 4px 4px' }}>
        {menuItems.map((item) => {
          const isActive = isMenuItemActive(item.path);
          
          return (
            <ListItem 
              button 
              key={item.label}
              component={Link}
              to={item.path}
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: '10px',
                mb: 0.5,
                backgroundColor: isActive ? primaryGreen : 'transparent',
                color: isActive ? '#fff' : 'inherit',
                '&:hover': {
                  backgroundColor: isActive ? darkGreen : 'rgba(0, 0, 0, 0.08)'
                },
                transition: 'background-color 0.2s',
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1 : 2
              }}
            >
              {collapsed ? (
                <Tooltip title={item.label} placement="right">
                  <ListItemIcon sx={{ 
                    color: isActive ? '#fff' : theme.palette.text.secondary,
                    minWidth: 0,
                    mr: 0
                  }}>
                    {item.icon}
                  </ListItemIcon>
                </Tooltip>
              ) : (
                <>
                  <ListItemIcon sx={{ 
                    color: isActive ? '#fff' : theme.palette.text.secondary,
                    minWidth: 40
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif'
                    }}
                  />
                </>
              )}
            </ListItem>
          );
        })}
      </List>

      {/* Perfil do usuário */}
      <Box 
        sx={{ 
          p: collapsed ? 1 : 1.5, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: '#d0d0d8',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '#c0c0c8'
          }
        }}
        onClick={handleOpenProfileModal}
      >
        {collapsed ? (
          <Tooltip title={`${user?.email || 'Usuário'} - Clique para editar perfil`} placement="right">
            <Avatar 
              sx={{ width: 32, height: 32 }}
              src={user?.avatarUrl || "https://randomuser.me/api/portraits/men/32.jpg"}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </Tooltip>
        ) : (
          <>
            <Avatar 
              sx={{ width: 40, height: 40 }}
              src={user?.avatarUrl || "https://randomuser.me/api/portraits/men/32.jpg"}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ ml: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                {user?.name || user?.email?.split('@')[0] || 'Usuário'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                {user?.email || 'usuario@exemplo.com'}
              </Typography>
            </Box>
            <IconButton 
              sx={{ ml: 'auto' }} 
              onClick={(e) => {
                e.stopPropagation(); // Evitar que o clique propague para o Box pai
                handleLogout();
              }}
              color="error"
            >
              <LogoutIcon />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {/* Modal de Perfil */}
      <ProfileModal 
        open={profileModalOpen} 
        onClose={handleCloseProfileModal} 
      />
      
      {/* Menu para dispositivos móveis */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            width: collapsed ? 72 : 280,
            boxSizing: 'border-box',
            borderRight: 'none',
            transition: 'width 0.3s ease'
          }
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Menu para desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            width: collapsed ? 72 : 280,
            boxSizing: 'border-box',
            borderRight: 'none',
            transition: 'width 0.3s ease'
          }
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default SideMenu;

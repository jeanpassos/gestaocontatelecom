import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Menu as MenuIcon
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import SideMenu from './SideMenu';
import Footer from './Footer';
import { useConnection } from '../../context/ConnectionContext';

interface AppleLayoutProps {
  children: React.ReactNode;
}

const AppleLayout: React.FC<AppleLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { isOffline } = useConnection();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // Mostrar mensagem de modo offline quando detectado
  React.useEffect(() => {
    if (isOffline) {
      setShowOfflineMessage(true);
    }
  }, [isOffline]);

  const handleCloseOfflineMessage = () => {
    setShowOfflineMessage(false);
  };

  return (
    <Box sx={{ display: 'flex', fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Menu lateral */}
      <Box
        component="nav"
        sx={{ 
          width: { sm: collapsed ? 72 : 280 }, 
          flexShrink: { sm: 0 }
        }}
      >
        <SideMenu 
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
        />
      </Box>
      
      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          width: { sm: `calc(100% - ${collapsed ? 72 : 280}px)` },
          transition: 'width 0.3s ease'
        }}
      >
        {/* Barra superior para dispositivos móveis */}
        <Box
          sx={{
            display: { xs: 'flex', sm: 'none' },
            alignItems: 'center',
            p: 2,
            backgroundColor: '#008069',
            color: '#fff'
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
            TelecomBill
          </Typography>
        </Box>
        
        {/* Conteúdo da página */}
        <Box sx={{ 
          p: { xs: 2, md: 3 },
          backgroundColor: '#f5f5f7',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ flex: 1 }}>
            {children}
          </Box>
          <Footer />
        </Box>
      </Box>

      {/* Mensagem de modo offline */}
      <Snackbar 
        open={showOfflineMessage} 
        autoHideDuration={6000} 
        onClose={handleCloseOfflineMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseOfflineMessage} 
          severity="info" 
          variant="filled"
          sx={{ 
            width: '100%', 
            backgroundColor: '#008069',
            '& .MuiAlert-icon': { color: 'white' },
            color: 'white'
          }}
        >
          Modo offline ativado. Usando dados simulados.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AppleLayout;

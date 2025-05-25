import { createTheme } from '@mui/material/styles';

// Tema inspirado no design da Apple
const theme = createTheme({

  palette: {
    primary: {
      main: '#008069', // Verde WhatsApp
      light: '#25D366', // Verde claro WhatsApp
      dark: '#075E54', // Verde escuro WhatsApp
    },
    secondary: {
      main: '#FF2D55', // Rosa Apple
      light: '#FF5E3A',
      dark: '#CC0033',
    },
    background: {
      default: '#F5F5F7', // Fundo cinza claro Apple
      paper: '#FFFFFF',
    },
    error: {
      main: '#FF3B30', // Vermelho Apple
    },
    warning: {
      main: '#FF9500', // Laranja Apple
    },
    info: {
      main: '#008069', // Verde WhatsApp
    },
    success: {
      main: '#34C759', // Verde Apple
    },
    text: {
      primary: '#1D1D1F', // Quase preto Apple
      secondary: '#86868B', // Cinza Apple
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            backgroundColor: '#0062CC',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          padding: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        // Apenas propriedades suportadas pelo MUI
        root: {
          // Cor padrão removida para permitir cores específicas por função
        },
        colorPrimary: {
          color: '#008069', // Verde WhatsApp - Visualizar
        },
        colorSecondary: {
          color: '#25D366', // Verde claro - Download
        },
        colorError: {
          color: '#FF3B30', // Vermelho - Excluir
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 128, 105, 0.04)',
          },
        },
        colorPrimary: {
          color: '#008069',
          '&:hover': {
            backgroundColor: 'rgba(0, 128, 105, 0.04)',
          },
        },
        colorInfo: {
          color: '#008069',
          '&:hover': {
            backgroundColor: 'rgba(0, 128, 105, 0.04)',
          },
        },
      },
    },
  },
});

export default theme;

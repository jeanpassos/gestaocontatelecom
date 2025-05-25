import React from 'react';
import { Box, Link, Typography, useTheme } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

const Footer: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box
      component="footer"
      sx={{
        py: 1.5,
        px: 2,
        mt: 'auto',
        backgroundColor: 'rgba(245, 245, 247, 0.8)',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        textAlign: 'center',
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
      }}
    >
      <Box sx={{ maxWidth: '600px', width: '100%' }}>
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.875rem',
          fontWeight: 400
        }}
      >
        Feito com 
        <FavoriteIcon 
          sx={{ 
            mx: 0.5, 
            fontSize: '0.875rem', 
            color: '#FF3B30'
          }} 
        /> 
        pela{' '}
        <Link
          href="https://scsite.com.br"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            ml: 0.5,
            color: theme.palette.primary.main,
            textDecoration: 'none',
            fontWeight: 500,
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          scsite.com.br
        </Link>
        {' '}| by Jean Passos
      </Typography>
      </Box>
    </Box>
  );
};

export default Footer;

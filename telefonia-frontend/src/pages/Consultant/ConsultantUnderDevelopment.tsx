import React from 'react';
import { Box, Typography, Paper, Button, Grid } from '@mui/material';
import { Construction as ConstructionIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ConsultantUnderDevelopment: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 800, mx: 'auto', mt: 4 }}>
        <ConstructionIcon sx={{ fontSize: 80, color: '#ED6C02', mb: 2 }} />
        
        <Typography variant="h4" gutterBottom>
          Área do Consultor em Desenvolvimento
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          Esta área está sendo implementada e estará disponível em breve. Como consultor, 
          você terá acesso ao dashboard, empresas atribuídas e suas faturas, com a 
          possibilidade de fazer upload de novas faturas.
        </Typography>
        
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/dashboard')}
            >
              Ir para Dashboard
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ConsultantUnderDevelopment;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  useTheme,
  CircularProgress,
  Button,
  IconButton,
  Avatar
} from '@mui/material';
import {
  ReceiptLong as ReceiptIcon,
  Business as BusinessIcon, 
  CreditCard as CreditCardIcon,
  Warning as WarningIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import AppLayout from '../../components/Layout/AppLayout';
import { useAuth } from '../../context/AuthContext';

// Serviço fictício de dashboard para simulação
const dashboardService = {
  getSummary: (): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalInvoices: 24,
          totalAmount: 34560.78,
          pendingInvoices: 8,
          overdueInvoices: 3,
          companies: 5,
          recentPayments: [
            { id: '1', amount: 1290.50, date: '2025-05-15', provider: 'Vivo', status: 'paid' },
            { id: '2', amount: 852.30, date: '2025-05-10', provider: 'Claro', status: 'paid' },
            { id: '3', amount: 435.90, date: '2025-05-05', provider: 'Tim', status: 'paid' }
          ],
          upcomingPayments: [
            { id: '4', amount: 1378.45, date: '2025-05-20', provider: 'Vivo', status: 'pending' },
            { id: '5', amount: 947.20, date: '2025-05-22', provider: 'Oi', status: 'pending' },
            { id: '6', amount: 532.75, date: '2025-05-28', provider: 'Tim', status: 'pending' }
          ]
        });
      }, 800);
    });
  }
};

// Componente de Card com estatística
const StatCard = ({ icon, title, value, delta, color }: any) => {
  const theme = useTheme();
  const isPositive = delta > 0;
  
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              width: 48,
              height: 48
            }}
          >
            {icon}
          </Avatar>
          <Box sx={{ ml: 'auto' }}>
            <IconButton size="small">
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
          {value}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {title}
        </Typography>
        
        {delta !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: isPositive ? theme.palette.success.main : theme.palette.error.main,
              }}
            >
              {isPositive ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
              {Math.abs(delta)}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              desde o mês passado
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para lista de pagamentos
const PaymentsList = ({ title, payments }: any) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      }}
    >
      <CardHeader
        title={title}
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
      />
      <Divider />
      <CardContent>
        {payments.map((payment: any) => (
          <Box
            key={payment.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.5,
              borderBottom: `1px solid ${theme.palette.divider}`,
              '&:last-child': {
                borderBottom: 'none',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: 
                    payment.provider === 'Vivo' ? '#0066CC' :
                    payment.provider === 'Claro' ? '#FF0000' :
                    payment.provider === 'Tim' ? '#0000FF' :
                    payment.provider === 'Oi' ? '#FFA500' : '#999999',
                  width: 36,
                  height: 36
                }}
              >
                {payment.provider.charAt(0)}
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {payment.provider}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(payment.date).toLocaleDateString('pt-BR')}
                </Typography>
              </Box>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                color: payment.status === 'paid' ? theme.palette.success.main : theme.palette.info.main
              }}
            >
              R$ {payment.amount.toFixed(2)}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardService.getSummary();
        setDashboardData(data);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  return (
    <AppLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Olá, {user?.email?.split('@')[0] || 'Usuário'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bem-vindo ao seu dashboard de gestão de contas de telefonia.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            icon={<ReceiptIcon />}
            title="Total de Faturas"
            value={dashboardData.totalInvoices}
            delta={12}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            icon={<CreditCardIcon />}
            title="Valor Total"
            value={formatCurrency(dashboardData.totalAmount)}
            delta={8}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            icon={<BusinessIcon />}
            title="Contratos"
            value={dashboardData.companies}
            delta={0}
            color="info"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            icon={<WarningIcon />}
            title="Faturas Vencidas"
            value={dashboardData.overdueInvoices}
            delta={-5}
            color="error"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          sx={{
            borderRadius: '10px',
            px: 3,
            py: 1.2,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 10px rgba(0, 122, 255, 0.3)',
          }}
          onClick={() => { /* Handle upload */ }}
        >
          Upload de Nova Fatura
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <PaymentsList title="Pagamentos Recentes" payments={dashboardData.recentPayments} />
        </Grid>
        <Grid item xs={12} md={6}>
          <PaymentsList title="Próximos Pagamentos" payments={dashboardData.upcomingPayments} />
        </Grid>
      </Grid>
    </AppLayout>
  );
};

export default DashboardPage;

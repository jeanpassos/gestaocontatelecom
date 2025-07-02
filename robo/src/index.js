const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { logger } = require('./utils/logger');
const robotRoutes = require('./routes/robot.routes');

// Inicialização do app Express
const app = express();
const PORT = process.env.PORT || 3030;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rotas estáticas para arquivos de screenshot/resultado
app.use('/static', express.static(path.join(__dirname, '../public')));

// Status da API
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'robo-service',
    version: '1.0.0'
  });
});

// Rotas do robô
app.use('/api/robot', robotRoutes);

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  logger.error(`Erro: ${err.message}`);
  
  res.status(err.statusCode || 500).json({
    error: true,
    message: err.message || 'Erro interno do servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`Servidor do robô iniciado na porta ${PORT}`);
  
  // Garantir que as pastas necessárias existam
  const publicDir = path.join(__dirname, '../public');
  const screenshotsDir = path.join(publicDir, 'screenshots');
  const resultsDir = path.join(publicDir, 'results');
  
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir);
});

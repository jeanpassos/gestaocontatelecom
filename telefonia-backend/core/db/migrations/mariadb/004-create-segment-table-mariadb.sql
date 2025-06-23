-- Criar tabela de segmentos adaptado para MariaDB
USE telefonia;

-- Remover tabela de segmentos se existir, para garantir a estrutura correta
DROP TABLE IF EXISTS segment;

-- Criar tabela de segmentos
CREATE TABLE IF NOT EXISTS segment (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  value VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir segmentos padrão na tabela 'segment'
INSERT INTO segment (id, name, value) VALUES
(UUID(), 'Comércio Varejista', 'comercio_varejista'),
(UUID(), 'Comércio Atacadista', 'comercio_atacadista'),
(UUID(), 'Indústria de Transformação', 'industria_transformacao'),
(UUID(), 'Indústria de Base', 'industria_base'),
(UUID(), 'Serviços Financeiros', 'servicos_financeiros'),
(UUID(), 'Serviços de Saúde', 'servicos_saude'),
(UUID(), 'Serviços de Educação', 'servicos_educacao'),
(UUID(), 'Serviços de Tecnologia', 'servicos_tecnologia'),
(UUID(), 'Construção Civil', 'construcao_civil'),
(UUID(), 'Agronegócio', 'agronegocio'),
(UUID(), 'Transporte e Logística', 'transporte_logistica'),
(UUID(), 'Alimentação e Bebidas', 'alimentacao_bebidas'),
(UUID(), 'Hotelaria e Turismo', 'hotelaria_turismo'),
(UUID(), 'Varejo de Moda', 'varejo_moda'),
(UUID(), 'Energia e Utilities', 'energia_utilities'),
(UUID(), 'Outro', 'outro');

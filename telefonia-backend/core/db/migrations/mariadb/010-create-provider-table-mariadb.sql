-- Criar tabela de provedores adaptado para MariaDB
USE telefonia;

CREATE TABLE IF NOT EXISTS provider (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  value VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'general', 
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT PK_provider_id PRIMARY KEY (id),
  CONSTRAINT UQ_provider_value UNIQUE (value)
);

-- Criar índices para melhor performance
CREATE INDEX IDX_provider_name ON provider (name);
CREATE INDEX IDX_provider_value ON provider (value);
CREATE INDEX IDX_provider_type ON provider (type);

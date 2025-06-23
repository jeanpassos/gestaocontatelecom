-- Adicionar coluna 'active' ao usuário adaptado para MariaDB
USE telefonia;

-- Adicionar coluna 'active' à tabela 'user' se não existir
ALTER TABLE user ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;

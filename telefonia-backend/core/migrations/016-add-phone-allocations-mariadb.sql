-- Migração 016: Adicionar coluna phone_allocations na tabela company
-- Data: 2025-06-23

-- Adicionar coluna phone_allocations para armazenar alocações de linhas telefônicas
ALTER TABLE company 
ADD COLUMN phone_allocations JSON NULL 
COMMENT 'Alocações de linhas telefônicas para usuários específicos';

-- Verificar se a coluna foi criada corretamente
-- SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = 'telefonia' AND TABLE_NAME = 'company' AND COLUMN_NAME = 'phone_allocations';

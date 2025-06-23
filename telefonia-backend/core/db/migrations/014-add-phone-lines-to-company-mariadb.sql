-- Migração 014: Adicionar phone_lines à tabela company (MariaDB)

-- Adicionar coluna phone_lines à tabela company
ALTER TABLE `company` 
ADD COLUMN `phone_lines` JSON NULL COMMENT 'Array de telefones da empresa em formato JSON';

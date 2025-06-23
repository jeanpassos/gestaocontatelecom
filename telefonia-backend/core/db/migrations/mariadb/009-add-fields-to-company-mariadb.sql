-- Adicionar campos à empresa adaptado para MariaDB
USE telefonia;

-- Adicionar novos campos à tabela company
ALTER TABLE company ADD COLUMN provider ENUM('vivo', 'claro', 'tim', 'oi', 'other') NULL;
ALTER TABLE company ADD COLUMN type ENUM('matriz', 'filial') NOT NULL DEFAULT 'matriz';
ALTER TABLE company ADD COLUMN contract_date DATE NULL;
ALTER TABLE company ADD COLUMN renewal_date DATE NULL;
ALTER TABLE company ADD COLUMN observation TEXT NULL;
ALTER TABLE company ADD COLUMN address JSON NULL;
ALTER TABLE company ADD COLUMN manager JSON NULL;

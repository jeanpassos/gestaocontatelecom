-- Atualizar relação empresa-provedor adaptado para MariaDB
USE telefonia;

-- Passo 1: Remover a coluna 'provider' antiga, se existir
-- MariaDB: tentaremos remover diretamente, ignorando erro se não existir
ALTER TABLE company DROP COLUMN provider;

-- Passo 2: Adicionar a nova coluna telephony_provider_id se ela não existir
ALTER TABLE company ADD COLUMN telephony_provider_id VARCHAR(36) NULL;

-- Passo 3: Adicionar a restrição de chave estrangeira
-- MariaDB: vamos tentar adicionar diretamente, se falhar é porque já existe
ALTER TABLE company ADD CONSTRAINT FK_company_telephony_provider 
  FOREIGN KEY (telephony_provider_id) REFERENCES provider(id) 
  ON DELETE SET NULL ON UPDATE CASCADE;

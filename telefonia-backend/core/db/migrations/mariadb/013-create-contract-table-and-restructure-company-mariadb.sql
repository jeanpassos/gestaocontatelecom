-- Criar tabela contract e reestruturar company adaptado para MariaDB
USE telefonia;

-- Passo 1: Criar a nova tabela 'contract'
CREATE TABLE IF NOT EXISTS contract (
    id VARCHAR(36) NOT NULL,
    company_id VARCHAR(36) NOT NULL,
    provider_id VARCHAR(36) NOT NULL,
    contract_number VARCHAR(100),
    phone_lines JSON,
    contract_date DATE,
    renewal_date DATE,
    monthly_fee DECIMAL(10,2),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    observation TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT PK_contract_id PRIMARY KEY (id),
    CONSTRAINT FK_contract_company FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_contract_provider FOREIGN KEY (provider_id) REFERENCES provider(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Adicionar índices para melhor performance
CREATE INDEX IDX_contract_company_id ON contract (company_id);
CREATE INDEX IDX_contract_provider_id ON contract (provider_id);

-- Passo 2: Migrar dados existentes da tabela 'company' para 'contract'
-- MariaDB não tem loops DO/FOR como PostgreSQL, então usamos INSERT direto
INSERT INTO contract (
    id,
    company_id,
    provider_id,
    contract_date,
    renewal_date,
    observation,
    phone_lines,
    status,
    created_at,
    updated_at
)
SELECT 
    UUID(),
    id,
    telephony_provider_id,
    contract_date,
    renewal_date,
    observation,
    phone_lines,
    'active',
    NOW(),
    NOW()
FROM company 
WHERE telephony_provider_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM contract c 
    WHERE c.company_id = company.id 
    AND c.provider_id = company.telephony_provider_id
);

-- Passo 3: Remover as colunas antigas da tabela 'company'
ALTER TABLE company DROP COLUMN IF EXISTS telephony_provider_id;
ALTER TABLE company DROP COLUMN IF EXISTS contract_date;
ALTER TABLE company DROP COLUMN IF EXISTS renewal_date;
ALTER TABLE company DROP COLUMN IF EXISTS observation;
ALTER TABLE company DROP COLUMN IF EXISTS phone_lines;

-- Criar esquema personalizado se não existir
CREATE SCHEMA IF NOT EXISTS telefonia;

-- Definir o esquema como padrão para esta sessão
SET search_path TO telefonia;

-- Criar tipos ENUM
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('admin', 'supervisor', 'client');
CREATE TYPE IF NOT EXISTS invoice_status AS ENUM ('pending', 'paid', 'overdue', 'canceled');
CREATE TYPE IF NOT EXISTS telco_provider AS ENUM ('vivo', 'claro', 'tim', 'oi', 'other');

-- Criar tabela de empresas
CREATE TABLE IF NOT EXISTS company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj VARCHAR(14) UNIQUE NOT NULL,
  corporate_name VARCHAR(255) NOT NULL,
  phone_lines JSONB NOT NULL DEFAULT '[]',
  assets JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  phone_number VARCHAR(15),
  avatar_url VARCHAR(255),
  company_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_company FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE
);

-- Criar tabela de faturas
CREATE TABLE IF NOT EXISTS invoice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  status invoice_status NOT NULL DEFAULT 'pending',
  provider telco_provider NOT NULL,
  pdf_url VARCHAR(255),
  invoice_details JSONB,
  company_id UUID NOT NULL,
  uploaded_by_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoice_company FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE,
  CONSTRAINT fk_invoice_user FOREIGN KEY (uploaded_by_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_company ON "user"(company_id);
CREATE INDEX idx_invoice_company ON invoice(company_id);
CREATE INDEX idx_invoice_status ON invoice(status);
CREATE INDEX idx_invoice_due_date ON invoice(due_date);

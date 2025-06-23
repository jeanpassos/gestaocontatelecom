-- Migração inicial adaptada para MariaDB
-- Criar banco de dados se não existir
CREATE DATABASE IF NOT EXISTS telefonia;
USE telefonia;

-- Criar tabela de empresas
CREATE TABLE IF NOT EXISTS company (
  id VARCHAR(36) PRIMARY KEY,
  cnpj VARCHAR(14) UNIQUE NOT NULL,
  corporate_name VARCHAR(255) NOT NULL,
  phone_lines JSON,
  assets JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS user (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'supervisor', 'client') NOT NULL DEFAULT 'client',
  phone_number VARCHAR(15),
  avatar_url VARCHAR(255),
  company_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_company FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE
);

-- Criar tabela de faturas
CREATE TABLE IF NOT EXISTS invoice (
  id VARCHAR(36) PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  status ENUM('pending', 'paid', 'overdue', 'canceled') NOT NULL DEFAULT 'pending',
  provider ENUM('vivo', 'claro', 'tim', 'oi', 'other') NOT NULL,
  pdf_url VARCHAR(255),
  invoice_details JSON,
  company_id VARCHAR(36) NOT NULL,
  uploaded_by_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoice_company FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE,
  CONSTRAINT fk_invoice_user FOREIGN KEY (uploaded_by_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_user_company ON user(company_id);
CREATE INDEX idx_invoice_company ON invoice(company_id);
CREATE INDEX idx_invoice_status ON invoice(status);
CREATE INDEX idx_invoice_due_date ON invoice(due_date);

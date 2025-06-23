-- Atualização schema usuário adaptado para MariaDB
USE telefonia;

-- Adicionar coluna 'name' ao usuário se não existir
ALTER TABLE user ADD COLUMN name VARCHAR(255);

-- Adicionar coluna 'phone' ao usuário se não existir  
ALTER TABLE user ADD COLUMN phone VARCHAR(20);

-- Alterar o enum 'role' para incluir 'consultant'
-- MariaDB: precisamos recriar a coluna com novo enum
ALTER TABLE user MODIFY COLUMN role ENUM('admin', 'supervisor', 'client', 'consultant') NOT NULL DEFAULT 'client';

-- Criar tabela pending_document se não existir
CREATE TABLE IF NOT EXISTS pending_document (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by_id VARCHAR(36) NOT NULL,
    processing_status ENUM('pending', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    error_message TEXT,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pending_document_company FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE,
    CONSTRAINT fk_pending_document_user FOREIGN KEY (uploaded_by_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Criar índices
CREATE INDEX idx_pending_document_company ON pending_document(company_id);
CREATE INDEX idx_pending_document_status ON pending_document(processing_status);
CREATE INDEX idx_pending_document_uploaded_by ON pending_document(uploaded_by_id);

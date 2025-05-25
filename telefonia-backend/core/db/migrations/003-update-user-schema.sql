-- Definir o esquema como padrão para esta sessão
SET search_path TO telefonia;

-- Atualizar o tipo user_role para incluir o papel de consultor
ALTER TYPE user_role ADD VALUE 'consultant' AFTER 'supervisor';

-- Adicionar coluna name à tabela de usuários
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Atualizar a tabela de usuários para incluir timestamps se ainda não existirem
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Renomear a coluna phone_number para phone se necessário (verificar se existe primeiro)
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'user' AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE "user" RENAME COLUMN phone_number TO phone;
    END IF;
END $$;

-- Adicionar coluna phone se não existir
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Adicionar coluna avatar_url se não existir
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);

-- Adicionar função de trigger para atualizar o timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar o timestamp quando o usuário for atualizado
DROP TRIGGER IF EXISTS update_user_timestamp ON "user";
CREATE TRIGGER update_user_timestamp
BEFORE UPDATE ON "user"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Criar tabela de documentos pendentes para empresas se não existir
CREATE TABLE IF NOT EXISTS pending_document (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pending_document_company FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE
);

-- Criar trigger para atualizar o timestamp quando o documento pendente for atualizado
DROP TRIGGER IF EXISTS update_pending_document_timestamp ON pending_document;
CREATE TRIGGER update_pending_document_timestamp
BEFORE UPDATE ON pending_document
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Criar índice para melhorar a performance de consultas de documentos pendentes
CREATE INDEX IF NOT EXISTS idx_pending_document_company ON pending_document(company_id);

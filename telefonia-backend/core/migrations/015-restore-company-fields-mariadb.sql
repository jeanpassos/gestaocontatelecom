-- Migração 015: Restaurar campos contractDate e renewalDate na tabela company
-- Data: 2025-06-22
-- Descrição: Restaura campos contract_date e renewal_date na tabela company para compatibilidade com frontend

-- Adicionar coluna contract_date se não existir
ALTER TABLE company 
ADD COLUMN IF NOT EXISTS contract_date DATE NULL;

-- Adicionar coluna renewal_date se não existir
ALTER TABLE company 
ADD COLUMN IF NOT EXISTS renewal_date DATE NULL;

-- Comentário para futura referência
-- As colunas foram restauradas da entidade Contract para Company
-- devido à incompatibilidade com o frontend que espera esses campos
-- diretamente na empresa, não em contratos separados

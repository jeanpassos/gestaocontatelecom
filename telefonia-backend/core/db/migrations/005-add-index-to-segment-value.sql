-- Definir o esquema como padrão para esta sessão
SET search_path TO telefonia;

-- Adicionar um índice na coluna 'value' da tabela 'segment'
CREATE INDEX IF NOT EXISTS idx_segment_value ON segment(value);

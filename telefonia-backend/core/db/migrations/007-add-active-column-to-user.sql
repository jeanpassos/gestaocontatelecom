-- Definir o esquema como padrão para esta sessão
SET search_path TO telefonia;

-- Adicionar coluna 'active' à tabela 'user' se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'telefonia' 
          AND table_name = 'user' 
          AND column_name = 'active'
    ) THEN
        ALTER TABLE "user" ADD COLUMN active BOOLEAN DEFAULT TRUE NOT NULL;
        RAISE NOTICE 'Coluna active adicionada à tabela user.';
    ELSE
        RAISE NOTICE 'Coluna active já existe na tabela user.';
    END IF;
END $$;

-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Comentado pois pode não estar disponível ou usuário sem permissão

CREATE TABLE IF NOT EXISTS "provider" ( -- Adicionado IF NOT EXISTS
  "id" uuid NOT NULL, -- Removido DEFAULT uuid_generate_v4(). TypeORM gerará o UUID.
  "name" VARCHAR(100) NOT NULL,
  "value" VARCHAR(50) NOT NULL,
  "type" VARCHAR(50) NOT NULL DEFAULT 'general', -- telephony, internet, general
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_provider_id" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_provider_value" UNIQUE ("value")
);

-- Os comandos CREATE INDEX geralmente falham se o índice já existe.
-- Para torná-los idempotentes, precisaríamos de blocos DO/BEGIN/IF NOT EXISTS,
-- o que pode ser mais complexo para índices ou usar CREATE INDEX CONCURRENTLY IF NOT EXISTS (PostgreSQL 9.5+).
-- Por simplicidade, vamos assumir que se a tabela já existe, os índices também podem já existir
-- e o script de migração pode reportar um erro nesses CREATE INDEX, mas não deve parar a execução
-- das migrações subsequentes se o erro for tratado como um aviso ou se o script continuar.
-- O script run-migrations.js atual para em qualquer erro.
-- Uma solução mais robusta seria verificar a existência de cada índice antes de criá-lo.

-- Tentativa de criar índices apenas se não existirem (sintaxe pode variar ou precisar de PL/pgSQL)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'IDX_provider_name' AND n.nspname = 'telefonia') THEN
        CREATE INDEX "IDX_provider_name" ON "provider" ("name");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'IDX_provider_value' AND n.nspname = 'telefonia') THEN
        CREATE INDEX "IDX_provider_value" ON "provider" ("value");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'IDX_provider_type' AND n.nspname = 'telefonia') THEN
        CREATE INDEX "IDX_provider_type" ON "provider" ("type");
    END IF;
END $$;

-- Adicionar função uuid_generate_v4() se não existir (comum em PostgreSQL)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Esta linha acima pode ser necessária se a função uuid_generate_v4() não estiver disponível.
-- Como o script de migração não lida com extensões, isso deve ser garantido no nível do banco.
-- A entidade usa @PrimaryGeneratedColumn('uuid'), que geralmente lida com isso.

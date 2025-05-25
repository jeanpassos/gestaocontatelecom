-- Passo 1: Criar a nova tabela 'contract'
CREATE TABLE IF NOT EXISTS "contract" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "company_id" uuid NOT NULL,
    "provider_id" uuid NOT NULL,
    "contract_number" character varying(100),
    "phone_lines" jsonb,
    "contract_date" date,
    "renewal_date" date,
    "monthly_fee" numeric(10,2),
    "status" character varying(50) NOT NULL DEFAULT 'pending',
    "observation" text,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_contract_id" PRIMARY KEY ("id"),
    CONSTRAINT "FK_contract_company" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FK_contract_provider" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE -- ou ON DELETE SET NULL
);

-- Adicionar um índice para company_id e provider_id na tabela contract para melhor performance em queries
CREATE INDEX IF NOT EXISTS "IDX_contract_company_id" ON "contract" ("company_id");
CREATE INDEX IF NOT EXISTS "IDX_contract_provider_id" ON "contract" ("provider_id");

-- Passo 2: Migrar dados existentes da tabela 'company' para 'contract'
-- Esta é uma parte crítica e pode precisar de ajustes dependendo da lógica exata de como os dados foram armazenados.
-- Vamos assumir que 'telephony_provider_id' na tabela 'company' é o que queremos usar para 'provider_id' no novo contrato.
-- E que os outros campos (contract_date, renewal_date, observation, phone_lines) também vêm da tabela 'company'.
DO $$
DECLARE
    company_record RECORD;
BEGIN
    -- Verificar se a coluna telephony_provider_id existe em company antes de tentar usá-la
    IF EXISTS(
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = current_schema() AND table_name='company' AND column_name='telephony_provider_id'
    )
    THEN
        FOR company_record IN SELECT "id", "telephony_provider_id", "contract_date", "renewal_date", "observation", "phone_lines" FROM "company" WHERE "telephony_provider_id" IS NOT NULL
        LOOP
            -- Insere um novo contrato apenas se um telephony_provider_id existir para a empresa
            INSERT INTO "contract" (
                "company_id",
                "provider_id",
                "contract_date",
                "renewal_date",
                "observation",
                "phone_lines",
                "status", -- Definir um status padrão, por exemplo 'active' para contratos migrados
                "created_at",
                "updated_at"
            )
            VALUES (
                company_record."id",
                company_record."telephony_provider_id",
                company_record."contract_date",
                company_record."renewal_date",
                company_record."observation",
                company_record."phone_lines",
                'active', -- Ou outro status que faça sentido para dados migrados
                NOW(),
                NOW()
            );
        END LOOP;
    END IF;
END $$;

-- Passo 3: Remover as colunas antigas da tabela 'company'
-- É mais seguro verificar se cada coluna existe antes de tentar removê-la.

DO $$ BEGIN IF EXISTS(SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name='company' AND column_name='telephony_provider_id') THEN ALTER TABLE "company" DROP COLUMN "telephony_provider_id"; END IF; END $$;
DO $$ BEGIN IF EXISTS(SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name='company' AND column_name='contract_date') THEN ALTER TABLE "company" DROP COLUMN "contract_date"; END IF; END $$;
DO $$ BEGIN IF EXISTS(SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name='company' AND column_name='renewal_date') THEN ALTER TABLE "company" DROP COLUMN "renewal_date"; END IF; END $$;
DO $$ BEGIN IF EXISTS(SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name='company' AND column_name='observation') THEN ALTER TABLE "company" DROP COLUMN "observation"; END IF; END $$;
DO $$ BEGIN IF EXISTS(SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name='company' AND column_name='phone_lines') THEN ALTER TABLE "company" DROP COLUMN "phone_lines"; END IF; END $$;

-- Nota: A coluna 'provider' (VARCHAR) já deveria ter sido removida pela migração 012.
-- Se por algum motivo ela ainda existir, o script da migração 012 já tenta removê-la.

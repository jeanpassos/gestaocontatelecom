-- Passo 1: Remover a coluna 'provider' antiga, se existir e não for a FK correta.
-- É mais seguro verificar se a coluna existe antes de tentar removê-la.
-- A sintaxe exata pode variar um pouco dependendo do estado exato do banco de dados.
-- Se a migração 009 já criou 'provider' como VARCHAR, precisamos removê-la.
DO $$
BEGIN
    IF EXISTS(
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'telefonia' AND table_name='company' AND column_name='provider'
    )
    THEN
        ALTER TABLE "company" DROP COLUMN "provider";
    END IF;
END $$;

-- Passo 2: Adicionar a nova coluna telephony_provider_id se ela não existir.
DO $$
BEGIN
    IF NOT EXISTS(
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'telefonia' AND table_name='company' AND column_name='telephony_provider_id'
    )
    THEN
        ALTER TABLE "company" ADD COLUMN "telephony_provider_id" uuid NULL;
    END IF;
END $$;

-- Passo 3: Adicionar a restrição de chave estrangeira se ela não existir.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'telefonia' AND table_name = 'company' AND constraint_name = 'FK_company_telephony_provider'
    )
    THEN
        ALTER TABLE "company"
        ADD CONSTRAINT "FK_company_telephony_provider"
        FOREIGN KEY ("telephony_provider_id")
        REFERENCES "provider"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;
END $$;

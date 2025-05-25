DO $$
BEGIN
    -- Adicionar coluna "provider" se não existir
    IF NOT EXISTS (
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'telefonia' AND table_name='company' AND column_name='provider'
    ) THEN
        ALTER TABLE "company" ADD COLUMN "provider" VARCHAR(50) NULL;
    END IF;

    -- Adicionar coluna "type" se não existir
    IF NOT EXISTS (
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'telefonia' AND table_name='company' AND column_name='type'
    ) THEN
        ALTER TABLE "company" ADD COLUMN "type" VARCHAR(50) NULL;
    END IF;

    -- Adicionar coluna "contract_date" se não existir
    IF NOT EXISTS (
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'telefonia' AND table_name='company' AND column_name='contract_date'
    ) THEN
        ALTER TABLE "company" ADD COLUMN "contract_date" DATE NULL;
    END IF;

    -- Adicionar coluna "renewal_date" se não existir
    IF NOT EXISTS (
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'telefonia' AND table_name='company' AND column_name='renewal_date'
    ) THEN
        ALTER TABLE "company" ADD COLUMN "renewal_date" DATE NULL;
    END IF;

    -- Adicionar coluna "observation" se não existir
    IF NOT EXISTS (
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'telefonia' AND table_name='company' AND column_name='observation'
    ) THEN
        ALTER TABLE "company" ADD COLUMN "observation" TEXT NULL;
    END IF;

    -- Adicionar coluna "address" se não existir
    IF NOT EXISTS (
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'telefonia' AND table_name='company' AND column_name='address'
    ) THEN
        ALTER TABLE "company" ADD COLUMN "address" JSONB NULL;
    END IF;

    -- Adicionar coluna "manager" se não existir
    IF NOT EXISTS (
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'telefonia' AND table_name='company' AND column_name='manager'
    ) THEN
        ALTER TABLE "company" ADD COLUMN "manager" JSONB NULL;
    END IF;
END $$;

-- A parte sobre a coluna "assets" ser nullable já estava comentada e pode permanecer assim,
-- pois a alteração da nulidade de uma coluna existente é mais delicada e depende do estado atual.
-- Se 'assets' já permite NULL, não há problema. Se não permite e precisa permitir,
-- isso deve ser tratado com cuidado para não perder dados ou causar falhas se houver dados NULL.

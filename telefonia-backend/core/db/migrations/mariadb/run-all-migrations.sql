-- Script para executar todas as migrações MariaDB em ordem
-- Execute este script no MariaDB remoto: 201.91.93.55

-- ==== MIGRAÇÃO 001: Schema Inicial ====
SOURCE 001-initial-schema-mariadb.sql;

-- ==== MIGRAÇÃO 002: Dados Iniciais ====
SOURCE 002-seed-data-mariadb.sql;

-- ==== MIGRAÇÃO 003: Atualização Schema Usuário ====
SOURCE 003-update-user-schema-mariadb.sql;

-- ==== MIGRAÇÃO 004: Tabela de Segmentos ====
SOURCE 004-create-segment-table-mariadb.sql;

-- ==== MIGRAÇÃO 007: Coluna Active Usuário ====
SOURCE 007-add-active-column-to-user-mariadb.sql;

-- ==== MIGRAÇÃO 008: Segmento na Empresa (Comentada) ====
SOURCE 008-add-segment-to-company-mariadb.sql;

-- ==== MIGRAÇÃO 009: Campos Adicionais Empresa ====
SOURCE 009-add-fields-to-company-mariadb.sql;

-- ==== MIGRAÇÃO 010: Tabela de Provedores ====
SOURCE 010-create-provider-table-mariadb.sql;

-- ==== MIGRAÇÃO 011: Dados dos Provedores ====
SOURCE 011-seed-providers-data-mariadb.sql;

-- ==== MIGRAÇÃO 012: Relação Empresa-Provedor ====
SOURCE 012-update-company-provider-relation-mariadb.sql;

-- ==== MIGRAÇÃO 013: Tabela Contract + Reestruturação ====
SOURCE 013-create-contract-table-and-restructure-company-mariadb.sql;

-- Verificação final
SHOW TABLES;
SELECT 'Migrações executadas com sucesso!' AS status;

-- Adicionar segmento à empresa adaptado para MariaDB
USE telefonia;

-- Esta migração foi comentada no original PostgreSQL
-- Mantendo comentada para MariaDB também
-- ALTER TABLE company ADD COLUMN segment_id CHAR(36);
--
-- ALTER TABLE company
-- ADD CONSTRAINT FK_company_segment
-- FOREIGN KEY (segment_id)
-- REFERENCES segment(id)
-- ON DELETE SET NULL
-- ON UPDATE CASCADE;

-- Coluna segment_id e FK_company_segment já existem, conforme log de erro.
-- Comentado para permitir que outras migrações sejam executadas.

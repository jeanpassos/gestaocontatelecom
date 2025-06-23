-- Migração 008: Adicionar segment_id à tabela company (MariaDB)

-- Adicionar coluna segment_id à tabela company
ALTER TABLE `company` 
ADD COLUMN `segment_id` CHAR(36) NULL;

-- Adicionar chave estrangeira para segment
ALTER TABLE `company`
ADD CONSTRAINT `FK_company_segment`
FOREIGN KEY (`segment_id`)
REFERENCES `segment`(`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Adicionar índice para melhor performance
CREATE INDEX `IDX_company_segment_id` ON `company` (`segment_id`);

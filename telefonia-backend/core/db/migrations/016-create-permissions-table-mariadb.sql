-- Migração 016: Criar tabela de permissões
-- Data: 2025-06-28
-- Descrição: Tabela para armazenar matriz de permissões dinâmica por role

-- Criar tabela de permissões
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` varchar(50) NOT NULL COMMENT 'Role do usuário (admin, supervisor, consultant, client)',
  `permission_id` varchar(100) NOT NULL COMMENT 'ID da permissão (ex: companies.view)',
  `granted` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Se a permissão está concedida (1) ou negada (0)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_permission` (`role`, `permission_id`),
  KEY `idx_role` (`role`),
  KEY `idx_permission_id` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir permissões padrão para cada role
-- Admin - acesso total
INSERT INTO `permissions` (`role`, `permission_id`, `granted`) VALUES
('admin', 'dashboard.view', 1),
('admin', 'companies.view', 1),
('admin', 'companies.create', 1),
('admin', 'companies.edit', 1),
('admin', 'companies.delete', 1),
('admin', 'invoices.view', 1),
('admin', 'invoices.upload', 1),
('admin', 'invoices.edit', 1),
('admin', 'invoices.delete', 1),
('admin', 'reports.view', 1),
('admin', 'reports.export', 1),
('admin', 'admin.view', 1),
('admin', 'users.view', 1),
('admin', 'users.create', 1),
('admin', 'users.edit', 1),
('admin', 'users.delete', 1),
('admin', 'permissions.manage', 1);

-- Supervisor - acesso médio
INSERT INTO `permissions` (`role`, `permission_id`, `granted`) VALUES
('supervisor', 'dashboard.view', 1),
('supervisor', 'companies.view', 1),
('supervisor', 'companies.create', 1),
('supervisor', 'companies.edit', 1),
('supervisor', 'invoices.view', 1),
('supervisor', 'invoices.upload', 1),
('supervisor', 'invoices.edit', 1),
('supervisor', 'reports.view', 1),
('supervisor', 'reports.export', 1),
('supervisor', 'users.view', 1);

-- Consultant - acesso limitado
INSERT INTO `permissions` (`role`, `permission_id`, `granted`) VALUES
('consultant', 'dashboard.view', 1),
('consultant', 'companies.view', 1),
('consultant', 'invoices.view', 1),
('consultant', 'consultant.dashboard', 1);

-- Client - acesso mínimo (apenas dashboard e faturas por padrão)
INSERT INTO `permissions` (`role`, `permission_id`, `granted`) VALUES
('client', 'dashboard.view', 1),
('client', 'invoices.view', 1);

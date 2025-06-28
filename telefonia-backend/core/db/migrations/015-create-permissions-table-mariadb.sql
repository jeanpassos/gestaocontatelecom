-- Migração para criar tabela de permissões no MariaDB

-- Criar tabela de permissões
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `role` VARCHAR(50) NOT NULL COMMENT 'Tipo de usuário (admin, supervisor, consultant, client)',
  `permission_id` VARCHAR(100) NOT NULL COMMENT 'Identificador único da permissão (ex: dashboard.view)',
  `granted` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Se a permissão está concedida para este role',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `role_permission_unique` (`role`, `permission_id`) COMMENT 'Garante que cada permissão só existe uma vez por role'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir permissões padrão para o administrador (concede todas as permissões)
INSERT IGNORE INTO `permissions` (`role`, `permission_id`, `granted`) VALUES
-- Dashboard
('admin', 'dashboard.view', 1),
-- Empresas/Contratos
('admin', 'companies.view', 1),
('admin', 'companies.create', 1),
('admin', 'companies.edit', 1),
('admin', 'companies.delete', 1),
-- Faturas
('admin', 'invoices.view', 1),
('admin', 'invoices.upload', 1),
('admin', 'invoices.edit', 1),
('admin', 'invoices.delete', 1),
-- Relatórios
('admin', 'reports.view', 1),
('admin', 'reports.export', 1),
-- Administração
('admin', 'admin.view', 1),
('admin', 'users.view', 1),
('admin', 'users.create', 1),
('admin', 'users.edit', 1),
('admin', 'users.delete', 1),
('admin', 'permissions.manage', 1),
-- Consultor
('admin', 'consultant.dashboard', 0),
('admin', 'consultant.proposals', 0),

-- Permissões para o supervisor
-- Dashboard
('supervisor', 'dashboard.view', 1),
-- Empresas/Contratos
('supervisor', 'companies.view', 1),
('supervisor', 'companies.create', 1),
('supervisor', 'companies.edit', 1),
('supervisor', 'companies.delete', 0),
-- Faturas
('supervisor', 'invoices.view', 1),
('supervisor', 'invoices.upload', 1),
('supervisor', 'invoices.edit', 1),
('supervisor', 'invoices.delete', 0),
-- Relatórios
('supervisor', 'reports.view', 1),
('supervisor', 'reports.export', 1),
-- Administração
('supervisor', 'admin.view', 0),
('supervisor', 'users.view', 1),
('supervisor', 'users.create', 0),
('supervisor', 'users.edit', 0),
('supervisor', 'users.delete', 0),
('supervisor', 'permissions.manage', 0),
-- Consultor
('supervisor', 'consultant.dashboard', 0),
('supervisor', 'consultant.proposals', 0),

-- Permissões para o consultor
-- Dashboard
('consultant', 'dashboard.view', 1),
-- Empresas/Contratos
('consultant', 'companies.view', 1),
('consultant', 'companies.create', 1),
('consultant', 'companies.edit', 1),
('consultant', 'companies.delete', 0),
-- Faturas
('consultant', 'invoices.view', 1),
('consultant', 'invoices.upload', 1),
('consultant', 'invoices.edit', 0),
('consultant', 'invoices.delete', 0),
-- Relatórios
('consultant', 'reports.view', 0),
('consultant', 'reports.export', 0),
-- Administração
('consultant', 'admin.view', 0),
('consultant', 'users.view', 0),
('consultant', 'users.create', 0),
('consultant', 'users.edit', 0),
('consultant', 'users.delete', 0),
('consultant', 'permissions.manage', 0),
-- Consultor
('consultant', 'consultant.dashboard', 1),
('consultant', 'consultant.proposals', 1),

-- Permissões para o cliente
-- Dashboard
('client', 'dashboard.view', 1),
-- Empresas/Contratos
('client', 'companies.view', 1),
('client', 'companies.create', 0),
('client', 'companies.edit', 0),
('client', 'companies.delete', 0),
-- Faturas
('client', 'invoices.view', 1),
('client', 'invoices.upload', 0),
('client', 'invoices.edit', 0),
('client', 'invoices.delete', 0),
-- Relatórios
('client', 'reports.view', 0),
('client', 'reports.export', 0),
-- Administração
('client', 'admin.view', 0),
('client', 'users.view', 0),
('client', 'users.create', 0),
('client', 'users.edit', 0),
('client', 'users.delete', 0),
('client', 'permissions.manage', 0),
-- Consultor
('client', 'consultant.dashboard', 0),
('client', 'consultant.proposals', 0);

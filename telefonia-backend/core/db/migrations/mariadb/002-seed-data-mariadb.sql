-- Dados iniciais adaptados para MariaDB
USE telefonia;

-- Inserir empresa exemplo
INSERT INTO company (id, cnpj, corporate_name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', '12345678000195', 'Empresa Exemplo Ltda')
ON DUPLICATE KEY UPDATE 
  cnpj = VALUES(cnpj),
  corporate_name = VALUES(corporate_name);

-- Inserir usuário admin
INSERT INTO user (id, email, password, role, company_id) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'admin@exemplo.com', '$2b$10$example.hash.password', 'admin', '550e8400-e29b-41d4-a716-446655440000')
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  password = VALUES(password),
  role = VALUES(role),
  company_id = VALUES(company_id);

-- Inserir usuário supervisor
INSERT INTO user (id, email, password, role, company_id) VALUES 
('550e8400-e29b-41d4-a716-446655440002', 'supervisor@exemplo.com', '$2b$10$example.hash.password', 'supervisor', '550e8400-e29b-41d4-a716-446655440000')
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  password = VALUES(password),
  role = VALUES(role),
  company_id = VALUES(company_id);

-- Inserir fatura exemplo
INSERT INTO invoice (id, invoice_number, amount, due_date, status, provider, company_id, uploaded_by_id) VALUES 
('550e8400-e29b-41d4-a716-446655440003', 'FAT-001-2024', 150.00, '2024-01-30', 'pending', 'vivo', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001')
ON DUPLICATE KEY UPDATE
  invoice_number = VALUES(invoice_number),
  amount = VALUES(amount),
  due_date = VALUES(due_date),
  status = VALUES(status),
  provider = VALUES(provider),
  company_id = VALUES(company_id),
  uploaded_by_id = VALUES(uploaded_by_id);

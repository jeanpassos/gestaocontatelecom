-- Definir o esquema como padrão para esta sessão
SET search_path TO telefonia;

-- Inserir empresa inicial
INSERT INTO company (id, cnpj, corporate_name, phone_lines, assets)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '12345678901234',
  'Empresa Demonstração Ltda',
  '["+5511999998888", "+5511999997777"]',
  '{"computadores": 10, "servidores": 2}'
)
ON CONFLICT (cnpj) DO NOTHING;

-- Inserir usuário administrador inicial
-- Senha: admin123 (hash bcrypt)
INSERT INTO "user" (id, email, password, role, company_id)
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 
  'admin@demo.com',
  '$2a$10$E0.p8d7Y.XqgS2.F9G5kX.A2gR0hJ4kL5nO6pQ7rS8tU0vW1xY2S', -- Hash atualizado para 'admin123'
  'admin',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
)
ON CONFLICT (email) DO NOTHING;

-- Inserir uma fatura de exemplo
INSERT INTO invoice (
  id, 
  invoice_number, 
  amount, 
  due_date, 
  status, 
  provider, 
  invoice_details, 
  company_id, 
  uploaded_by_id
)
VALUES (
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'VIVO-2025-05-123456',
  299.90,
  '2025-05-25',
  'pending',
  'vivo',
  '{"items": [{"description": "Plano Controle", "value": 199.90}, {"description": "Serviços Adicionais", "value": 100.00}]}',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'
)
ON CONFLICT DO NOTHING;

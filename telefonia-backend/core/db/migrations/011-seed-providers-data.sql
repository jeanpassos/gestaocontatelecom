-- Gerar UUIDs manualmente para cada entrada, já que uuid_generate_v4() pode não estar disponível
-- e o DEFAULT foi removido da definição da tabela.
-- Estes são UUIDs v4 gerados aleatoriamente.
INSERT INTO "provider" ("id", "name", "value", "type") VALUES
('a1b2c3d4-e5f6-7777-8888-999900000001', 'Vivo', 'vivo', 'telephony'),
('a1b2c3d4-e5f6-7777-8888-999900000002', 'Claro', 'claro', 'telephony'),
('a1b2c3d4-e5f6-7777-8888-999900000003', 'TIM', 'tim', 'telephony'),
('a1b2c3d4-e5f6-7777-8888-999900000004', 'Oi', 'oi', 'telephony'),
('a1b2c3d4-e5f6-7777-8888-999900000005', 'Algar Telecom', 'algar', 'telephony'),
('a1b2c3d4-e5f6-7777-8888-999900000006', 'Nextel', 'nextel', 'telephony'),
('a1b2c3d4-e5f6-7777-8888-999900000007', 'Correios Celular', 'correios_celular', 'telephony'),

('a1b2c3d4-e5f6-7777-8888-999900000008', 'Vivo Fibra', 'vivo_fibra', 'internet'),
('a1b2c3d4-e5f6-7777-8888-999900000009', 'Claro NET Vírtua', 'claro_net', 'internet'),
('a1b2c3d4-e5f6-7777-8888-999900000010', 'TIM Live', 'tim_live', 'internet'),
('a1b2c3d4-e5f6-7777-8888-999900000011', 'Oi Fibra', 'oi_fibra', 'internet'),
('a1b2c3d4-e5f6-7777-8888-999900000012', 'HughesNet', 'hughesnet', 'internet'),
('a1b2c3d4-e5f6-7777-8888-999900000013', 'Starlink', 'starlink', 'internet'),
('a1b2c3d4-e5f6-7777-8888-999900000014', 'Provedor Regional Genérico', 'regional_provider', 'internet'),

('a1b2c3d4-e5f6-7777-8888-999900000015', 'Outra (Telefonia)', 'other_telephony', 'telephony'),
('a1b2c3d4-e5f6-7777-8888-999900000016', 'Outra (Internet)', 'other_internet', 'internet');

-- Adicionar mais conforme necessário, sempre fornecendo um UUID único para a coluna "id".

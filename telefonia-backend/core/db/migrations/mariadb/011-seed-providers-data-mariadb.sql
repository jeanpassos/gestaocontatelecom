-- Dados iniciais de provedores adaptado para MariaDB
USE telefonia;

-- Inserir dados de provedores com IDs fixos
INSERT INTO provider (id, name, value, type) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Vivo', 'vivo', 'telephony'),
('550e8400-e29b-41d4-a716-446655440011', 'Claro', 'claro', 'telephony'),
('550e8400-e29b-41d4-a716-446655440012', 'TIM', 'tim', 'telephony'),
('550e8400-e29b-41d4-a716-446655440013', 'Oi', 'oi', 'telephony'),
('550e8400-e29b-41d4-a716-446655440014', 'NET', 'net', 'internet'),
('550e8400-e29b-41d4-a716-446655440015', 'Unifique', 'unifique', 'internet'),
('550e8400-e29b-41d4-a716-446655440016', 'Outros', 'other', 'general'),
('550e8400-e29b-41d4-a716-446655440017', 'Algar Telecom', 'algar', 'telephony'),
('550e8400-e29b-41d4-a716-446655440018', 'Nextel', 'nextel', 'telephony'),
('550e8400-e29b-41d4-a716-446655440019', 'Correios Celular', 'correios_celular', 'telephony'),
('550e8400-e29b-41d4-a716-446655440020', 'Vivo Fibra', 'vivo_fibra', 'internet'),
('550e8400-e29b-41d4-a716-446655440021', 'Claro NET Vírtua', 'claro_net', 'internet'),
('550e8400-e29b-41d4-a716-446655440022', 'TIM Live', 'tim_live', 'internet'),
('550e8400-e29b-41d4-a716-446655440023', 'Oi Fibra', 'oi_fibra', 'internet'),
('550e8400-e29b-41d4-a716-446655440024', 'HughesNet', 'hughesnet', 'internet'),
('550e8400-e29b-41d4-a716-446655440025', 'Starlink', 'starlink', 'internet'),
('550e8400-e29b-41d4-a716-446655440026', 'Provedor Regional Genérico', 'regional_provider', 'internet'),
('550e8400-e29b-41d4-a716-446655440027', 'Outra (Telefonia)', 'other_telephony', 'telephony'),
('550e8400-e29b-41d4-a716-446655440028', 'Outra (Internet)', 'other_internet', 'internet')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  value = VALUES(value),
  type = VALUES(type);

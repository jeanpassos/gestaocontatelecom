-- Definir o esquema como padrão para esta sessão
SET search_path TO telefonia;

-- Inserir segmentos padrão na tabela 'segment'
INSERT INTO segment (name, value) VALUES
('Comércio Varejista', 'comercio_varejista'),
('Comércio Atacadista', 'comercio_atacadista'),
('Indústria de Transformação', 'industria_transformacao'),
('Indústria de Base', 'industria_base'),
('Serviços Financeiros', 'servicos_financeiros'),
('Serviços de Saúde', 'servicos_saude'),
('Serviços de Educação', 'servicos_educacao'),
('Serviços de Tecnologia', 'servicos_tecnologia'),
('Construção Civil', 'construcao_civil'),
('Agronegócio', 'agronegocio'),
('Transporte e Logística', 'transporte_logistica'),
('Alimentação e Bebidas', 'alimentacao_bebidas'),
('Hotelaria e Turismo', 'hotelaria_turismo'),
('Entretenimento e Mídia', 'entretenimento_midia'),
('Telecomunicações', 'telecomunicacoes'),
('Energia', 'energia'),
('Serviços Públicos', 'servicos_publicos'),
('Terceiro Setor', 'terceiro_setor'),
('Consultoria Empresarial', 'consultoria_empresarial'),
('Outros', 'outros')
ON CONFLICT (value) DO NOTHING;

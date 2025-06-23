const mysql = require('mysql2/promise');

// Configuração do banco de dados
const dbConfig = {
  host: '201.91.93.55',
  user: 'telefonia',
  password: 'ZHADyZKreJLjh6RM',
  database: 'telefonia',
  port: 3306
};

async function testProviderPersistence() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao MariaDB');
    
    // 1. Verificar se operadoras existem na tabela provider
    console.log('\n=== VERIFICANDO OPERADORAS DISPONÍVEIS ===');
    const [providers] = await connection.execute(`
      SELECT id, name, type FROM provider 
      WHERE type = 'telephony'
      ORDER BY name
    `);
    
    console.log('Operadoras de telefonia cadastradas:');
    providers.forEach(provider => {
      console.log(`- ID: ${provider.id}, Nome: ${provider.name}`);
    });
    
    if (providers.length === 0) {
      console.log('❌ Nenhuma operadora de telefonia encontrada na tabela provider');
      return;
    }
    
    // 2. Verificar estrutura atual da tabela company
    console.log('\n=== VERIFICANDO ESTRUTURA DA TABELA COMPANY ===');
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM company 
      WHERE Field IN ('telephony_provider_id', 'observation')
    `);
    
    console.log('Colunas relacionadas à operadora e observação:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null} ${col.Default}`);
    });
    
    // 3. Criar empresa de teste via INSERT direto para verificar se coluna existe
    console.log('\n=== TESTANDO INSERÇÃO DIRETA NO BANCO ===');
    const testProviderId = providers[0].id;
    const testCNPJ = '11111111000199';
    
    try {
      // Primeiro verificar se já existe empresa de teste
      const [existing] = await connection.execute(
        'SELECT id FROM company WHERE cnpj = ?', 
        [testCNPJ]
      );
      
      if (existing.length > 0) {
        console.log('Removendo empresa de teste existente...');
        await connection.execute('DELETE FROM company WHERE cnpj = ?', [testCNPJ]);
      }
      
      const [result] = await connection.execute(`
        INSERT INTO company (
          id, cnpj, corporate_name, telephony_provider_id, observation, created_at, updated_at
        ) VALUES (
          UUID(), ?, 'Empresa Teste Operadora', ?, 'Teste de observação', NOW(), NOW()
        )
      `, [testCNPJ, testProviderId]);
      
      console.log('✅ Empresa de teste inserida com sucesso');
      console.log(`ID da operadora inserida: ${testProviderId}`);
      console.log('Observação inserida: "Teste de observação"');
      
      // 4. Verificar se foi salvo corretamente
      console.log('\n=== VERIFICANDO DADOS SALVOS ===');
      const [savedData] = await connection.execute(`
        SELECT 
          c.id, 
          c.corporate_name, 
          c.telephony_provider_id,
          c.observation,
          p.name as provider_name
        FROM company c
        LEFT JOIN provider p ON c.telephony_provider_id = p.id
        WHERE c.cnpj = ?
      `, [testCNPJ]);
      
      if (savedData.length > 0) {
        const company = savedData[0];
        console.log('✅ Dados encontrados:');
        console.log(`- Empresa: ${company.corporate_name}`);
        console.log(`- ID Operadora: ${company.telephony_provider_id}`);
        console.log(`- Nome Operadora: ${company.provider_name || 'Não encontrada'}`);
        console.log(`- Observação: ${company.observation || 'Vazia'}`);
      } else {
        console.log('❌ Empresa de teste não encontrada após inserção');
      }
      
      // Limpar dados de teste
      await connection.execute('DELETE FROM company WHERE cnpj = ?', [testCNPJ]);
      console.log('🧹 Empresa de teste removida');
      
    } catch (insertError) {
      console.error('❌ Erro ao inserir empresa de teste:', insertError.message);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Conexão fechada');
    }
  }
}

testProviderPersistence();

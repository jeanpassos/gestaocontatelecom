const mysql = require('mysql2/promise');

// Configuração do banco de dados
const dbConfig = {
  host: '201.91.93.55',
  user: 'telefonia',
  password: 'ZHADyZKreJLjh6RM',
  database: 'telefonia',
  port: 3306
};

async function checkTelephonyProvider() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao MariaDB');
    
    // 1. Verificar se a coluna telephony_provider_id existe na tabela company
    console.log('\n=== VERIFICANDO ESTRUTURA DA TABELA COMPANY ===');
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM company LIKE '%provider%'
    `);
    console.log('Colunas relacionadas a provider:', columns);
    
    // 2. Verificar todas as colunas da tabela company
    console.log('\n=== TODAS AS COLUNAS DA TABELA COMPANY ===');
    const [allColumns] = await connection.execute('SHOW COLUMNS FROM company');
    allColumns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null} ${col.Key} ${col.Default}`);
    });
    
    // 3. Verificar dados das empresas - focando em campos de operadora
    console.log('\n=== VERIFICANDO DADOS DAS EMPRESAS ===');
    const [companies] = await connection.execute(`
      SELECT 
        id, 
        corporate_name, 
        telephony_provider_id,
        assets
      FROM company 
      LIMIT 5
    `);
    
    companies.forEach(company => {
      console.log(`\n--- Empresa: ${company.corporate_name} ---`);
      console.log(`ID: ${company.id}`);
      console.log(`telephony_provider_id: ${company.telephony_provider_id}`);
      console.log(`assets: ${company.assets ? JSON.stringify(JSON.parse(company.assets), null, 2) : 'null'}`);
    });
    
    // 4. Verificar tabela de providers
    console.log('\n=== VERIFICANDO TABELA PROVIDER ===');
    const [providers] = await connection.execute(`
      SELECT id, name, type FROM provider ORDER BY type, name
    `);
    
    console.log('Providers cadastrados:');
    providers.forEach(provider => {
      console.log(`- ID: ${provider.id}, Nome: ${provider.name}, Tipo: ${provider.type}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Conexão fechada');
    }
  }
}

checkTelephonyProvider();

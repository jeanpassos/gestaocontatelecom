const mysql = require('mysql2/promise');

async function testCompanyProvider() {
  const connection = await mysql.createConnection({
    host: '201.91.93.55',
    user: 'telefonia',
    password: 'ZHADyZKreJLjh6RM',
    database: 'telefonia'
  });

  try {
    console.log('🔍 Testando dados de empresa e operadora...\n');

    // Buscar empresas com seus dados
    console.log('=== EMPRESAS NO BANCO ===');
    const [companies] = await connection.execute(`
      SELECT 
        id, 
        corporate_name, 
        cnpj,
        telephony_provider_id,
        assets
      FROM company 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    companies.forEach((company, index) => {
      console.log(`\n📋 Empresa ${index + 1}:`);
      console.log(`  - ID: ${company.id}`);
      console.log(`  - Nome: ${company.corporate_name}`);
      console.log(`  - CNPJ: ${company.cnpj}`);
      console.log(`  - telephony_provider_id: ${company.telephony_provider_id}`);
      
      // Verificar se tem operadora nos assets
      if (company.assets) {
        try {
          const assets = JSON.parse(company.assets);
          console.log(`  - assets.internet.provider: ${assets?.internet?.provider || 'N/A'}`);
        } catch (e) {
          console.log(`  - assets: erro ao parsear JSON`);
        }
      } else {
        console.log(`  - assets: null`);
      }
    });

    // Buscar provedores disponíveis
    console.log('\n\n=== PROVEDORES DISPONÍVEIS ===');
    const [providers] = await connection.execute(`
      SELECT id, name, type 
      FROM provider 
      ORDER BY name
    `);

    providers.forEach((provider, index) => {
      console.log(`${index + 1}. ${provider.name} (ID: ${provider.id}, Tipo: ${provider.type})`);
    });

    // Teste JOIN empresa + provedor
    console.log('\n\n=== JOIN EMPRESA + PROVEDOR ===');
    const [joinResult] = await connection.execute(`
      SELECT 
        c.id,
        c.corporate_name,
        c.telephony_provider_id,
        p.name as provider_name,
        p.type as provider_type
      FROM company c
      LEFT JOIN provider p ON c.telephony_provider_id = p.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `);

    joinResult.forEach((row, index) => {
      console.log(`\n🔗 Join ${index + 1}:`);
      console.log(`  - Empresa: ${row.corporate_name}`);
      console.log(`  - telephony_provider_id: ${row.telephony_provider_id}`);
      console.log(`  - Operadora: ${row.provider_name || 'NULL'}`);
      console.log(`  - Tipo: ${row.provider_type || 'NULL'}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

testCompanyProvider().catch(console.error);

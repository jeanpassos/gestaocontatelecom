const mysql = require('mysql2/promise');

async function testAssetsParsing() {
  const connection = await mysql.createConnection({
    host: '201.91.93.55',
    user: 'telefonia',
    password: 'ZHADyZKreJLjh6RM',
    database: 'telefonia'
  });

  try {
    console.log('🔍 Testando parsing dos assets...\n');

    // Buscar dados RAW dos assets
    const [companies] = await connection.execute(`
      SELECT 
        id, 
        corporate_name, 
        assets
      FROM company 
      ORDER BY created_at DESC 
      LIMIT 3
    `);

    companies.forEach((company, index) => {
      console.log(`\n📋 Empresa ${index + 1}: ${company.corporate_name}`);
      console.log(`🆔 ID: ${company.id}`);
      console.log(`📦 Assets RAW:`, company.assets);
      console.log(`📦 Assets tipo:`, typeof company.assets);
      
      if (company.assets) {
        try {
          // Tentar diferentes abordagens de parsing
          let parsed;
          
          if (typeof company.assets === 'string') {
            parsed = JSON.parse(company.assets);
            console.log(`✅ Parsed como string:`, JSON.stringify(parsed, null, 2));
          } else if (typeof company.assets === 'object') {
            parsed = company.assets;
            console.log(`✅ Já é objeto:`, JSON.stringify(parsed, null, 2));
          }
          
          // Verificar se tem operadora nos assets
          if (parsed?.internet?.provider) {
            console.log(`🌐 OPERADORA ENCONTRADA: "${parsed.internet.provider}"`);
          } else {
            console.log(`❌ Operadora não encontrada em assets.internet.provider`);
          }
          
        } catch (e) {
          console.log(`❌ Erro no parsing:`, e.message);
          console.log(`🔍 Tentando decodificar como diferentes tipos...`);
          
          // Mostrar primeiros caracteres para debug
          const preview = company.assets.toString().substring(0, 100);
          console.log(`🔍 Preview dos primeiros 100 chars: "${preview}"`);
        }
      } else {
        console.log(`📦 Assets é null/undefined`);
      }
      
      console.log('─'.repeat(60));
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

testAssetsParsing().catch(console.error);

const mysql = require('mysql2/promise');

async function testCompanyFields() {
  const connection = await mysql.createConnection({
    host: '201.91.93.55',
    user: 'telefonia',
    password: 'ZHADyZKreJLjh6RM',
    database: 'telefonia'
  });

  try {
    console.log('🔍 Testando campos da empresa após migração 015...');
    
    // Verificar estrutura atual da tabela company
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM company
    `);
    
    console.log('📋 Estrutura da tabela company:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} (Null: ${col.Null}, Default: ${col.Default})`);
    });
    
    console.log('\n📊 Dados das empresas:');
    
    // Verificar dados das empresas com foco nos campos problemáticos
    const [companies] = await connection.query(`
      SELECT 
        id,
        corporate_name,
        type,
        segment_id,
        contract_date,
        renewal_date
      FROM company
    `);
    
    companies.forEach(company => {
      console.log(`\n🏢 ${company.corporate_name}:`);
      console.log(`  - ID: ${company.id}`);
      console.log(`  - Tipo: ${company.type || 'NULL'}`);
      console.log(`  - Segment ID: ${company.segment_id || 'NULL'}`);
      console.log(`  - Data Contrato: ${company.contract_date || 'NULL'}`);
      console.log(`  - Data Renovação: ${company.renewal_date || 'NULL'}`);
    });
    
    // Verificar segmentos disponíveis
    console.log('\n🎯 Segmentos disponíveis:');
    const [segments] = await connection.query(`
      SELECT id, name, value FROM segment
    `);
    
    segments.forEach(segment => {
      console.log(`- ${segment.name} (${segment.value}) - ID: ${segment.id}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

testCompanyFields();

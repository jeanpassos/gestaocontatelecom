const mysql = require('mysql2/promise');

async function testPhoneLines() {
  const connection = await mysql.createConnection({
    host: '201.91.93.55',
    user: 'telefonia',
    password: 'ZHADyZKreJLjh6RM',
    database: 'telefonia'
  });

  try {
    console.log('🔗 Testando phoneLines no banco...');
    
    // Verificar estrutura da tabela company
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM company WHERE Field LIKE '%phone%'
    `);
    
    console.log('📋 Colunas relacionadas a telefone:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} (${col.Null}, Default: ${col.Default})`);
    });
    
    // Verificar dados existentes
    const [companies] = await connection.query(`
      SELECT id, corporate_name, phone_lines 
      FROM company 
      WHERE phone_lines IS NOT NULL 
      LIMIT 5
    `);
    
    console.log('📞 Empresas com phoneLines:');
    companies.forEach(company => {
      console.log(`- ID: ${company.id}, Nome: ${company.corporate_name}`);
      console.log(`  phoneLines: ${company.phone_lines}`);
    });
    
    // Verificar total de empresas
    const [total] = await connection.query(`
      SELECT COUNT(*) as total FROM company
    `);
    
    console.log(`📊 Total de empresas: ${total[0].total}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

testPhoneLines();

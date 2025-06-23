const mysql = require('mysql2/promise');

async function testSimpleFields() {
  const connection = await mysql.createConnection({
    host: '201.91.93.55',
    user: 'telefonia',
    password: 'ZHADyZKreJLjh6RM',
    database: 'telefonia'
  });

  try {
    console.log('🔍 Verificando campos críticos...\n');
    
    // Verificar se as colunas existem
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'telefonia' 
      AND TABLE_NAME = 'company' 
      AND COLUMN_NAME IN ('type', 'segment_id', 'contract_date', 'renewal_date')
      ORDER BY COLUMN_NAME
    `);
    
    console.log('📋 Colunas críticas na tabela company:');
    columns.forEach(col => {
      console.log(`✅ ${col.COLUMN_NAME}: ${col.DATA_TYPE} (Nullable: ${col.IS_NULLABLE})`);
    });
    
    if (columns.length === 0) {
      console.log('❌ PROBLEMA: Nenhuma das colunas críticas foi encontrada!');
      return;
    }
    
    // Verificar dados de 1 empresa apenas
    const [companies] = await connection.query(`
      SELECT id, corporate_name, type, segment_id, contract_date, renewal_date
      FROM company 
      LIMIT 1
    `);
    
    if (companies.length > 0) {
      const company = companies[0];
      console.log('\n🏢 Exemplo de empresa:');
      console.log(`Nome: ${company.corporate_name}`);
      console.log(`Tipo: ${company.type || 'NULL'}`);
      console.log(`Segment ID: ${company.segment_id || 'NULL'}`);
      console.log(`Data Contrato: ${company.contract_date || 'NULL'}`);
      console.log(`Data Renovação: ${company.renewal_date || 'NULL'}`);
    }
    
    console.log('\n✅ Diagnóstico concluído');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

testSimpleFields();

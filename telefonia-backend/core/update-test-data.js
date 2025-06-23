const mysql = require('mysql2/promise');

async function updateTestData() {
  const connection = await mysql.createConnection({
    host: '201.91.93.55',
    user: 'telefonia',
    password: 'ZHADyZKreJLjh6RM',
    database: 'telefonia'
  });

  try {
    console.log('🛠️ Atualizando dados de teste com campos que faltam...\n');
    
    // Buscar segmentos disponíveis
    const [segments] = await connection.query('SELECT id, name FROM segment LIMIT 1');
    const segmentId = segments.length > 0 ? segments[0].id : null;
    
    if (segmentId) {
      console.log(`✅ Usando segmento: ${segments[0].name} (ID: ${segmentId})`);
    }
    
    // Atualizar empresa existente com os campos que faltam
    const updateQuery = `
      UPDATE company 
      SET 
        segment_id = ?, 
        contract_date = '2024-01-15', 
        renewal_date = '2025-01-15'
      WHERE corporate_name = 'GRUPO DE TECNOLOGIA JM LTDA'
    `;
    
    const [result] = await connection.query(updateQuery, [segmentId]);
    
    if (result.affectedRows > 0) {
      console.log('✅ Empresa atualizada com sucesso!');
      
      // Verificar resultado
      const [updated] = await connection.query(`
        SELECT c.corporate_name, c.type, c.contract_date, c.renewal_date, s.name as segment_name
        FROM company c
        LEFT JOIN segment s ON c.segment_id = s.id
        WHERE c.corporate_name = 'GRUPO DE TECNOLOGIA JM LTDA'
      `);
      
      if (updated.length > 0) {
        const company = updated[0];
        console.log('\n📊 Dados atualizados:');
        console.log(`Nome: ${company.corporate_name}`);
        console.log(`Tipo: ${company.type}`);
        console.log(`Segmento: ${company.segment_name || 'NULL'}`);
        console.log(`Data Contrato: ${company.contract_date}`);
        console.log(`Data Renovação: ${company.renewal_date}`);
      }
    } else {
      console.log('❌ Nenhuma empresa foi atualizada');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

updateTestData();

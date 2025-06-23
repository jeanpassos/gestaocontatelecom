const mysql = require('mysql2/promise');
const fs = require('fs').promises;

async function runMigration008() {
  const connection = await mysql.createConnection({
    host: '201.91.93.55',
    user: 'telefonia',
    password: 'ZHADyZKreJLjh6RM',
    database: 'telefonia',
    multipleStatements: true
  });

  try {
    console.log('🔗 Conectado ao MariaDB');
    
    // Ler migração 008
    const migration008 = await fs.readFile('./db/migrations/008-add-segment-to-company-mariadb.sql', 'utf8');
    
    console.log('📋 Executando migração 008...');
    console.log('SQL:', migration008);
    
    // Executar migração
    await connection.query(migration008);
    
    console.log('✅ Migração 008 executada com sucesso!');
    
    // Verificar se a coluna foi criada
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM company LIKE 'segment_id'
    `);
    
    if (columns.length > 0) {
      console.log('✅ Coluna segment_id criada na tabela company');
      console.log('Detalhes da coluna:', columns[0]);
    } else {
      console.log('❌ Coluna segment_id não foi encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro ao executar migração 008:', error.message);
    
    if (error.message.includes('Duplicate column')) {
      console.log('ℹ️ Coluna segment_id já existe - tudo ok!');
    }
  } finally {
    await connection.end();
    console.log('🔌 Conexão fechada');
  }
}

runMigration008();

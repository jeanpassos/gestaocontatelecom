const mysql = require('mysql2/promise');
const fs = require('fs').promises;

async function runMigration014() {
  const connection = await mysql.createConnection({
    host: '201.91.93.55',
    user: 'telefonia',
    password: 'ZHADyZKreJLjh6RM',
    database: 'telefonia',
    multipleStatements: true
  });

  try {
    console.log('🔗 Conectado ao MariaDB');
    
    // Verificar se a coluna phone_lines já existe
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM company LIKE 'phone_lines'
    `);
    
    if (columns.length > 0) {
      console.log('✅ Coluna phone_lines já existe na tabela company');
      return;
    }
    
    // Ler migração 014
    const migration014 = await fs.readFile('./db/migrations/014-add-phone-lines-to-company-mariadb.sql', 'utf8');
    
    console.log('📋 Executando migração 014...');
    console.log('SQL:', migration014);
    
    // Executar migração
    await connection.query(migration014);
    
    console.log('✅ Migração 014 executada com sucesso!');
    
    // Verificar se a coluna foi criada
    const [newColumns] = await connection.query(`
      SHOW COLUMNS FROM company LIKE 'phone_lines'
    `);
    
    if (newColumns.length > 0) {
      console.log('✅ Coluna phone_lines criada na tabela company');
      console.log('Detalhes da coluna:', newColumns[0]);
    } else {
      console.log('❌ Coluna phone_lines não foi encontrada após migração');
    }
    
  } catch (error) {
    console.error('❌ Erro ao executar migração 014:', error.message);
  } finally {
    await connection.end();
    console.log('🔌 Conexão fechada');
  }
}

runMigration014();

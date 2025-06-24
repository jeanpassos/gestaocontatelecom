const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration016() {
  const connection = await mysql.createConnection({
    host: '201.91.93.55',
    user: 'telefonia',
    password: 'ZHADyZKreJLjh6RM',
    database: 'telefonia',
    multipleStatements: false
  });

  try {
    console.log('🔄 Executando migração 016: Adicionar coluna phone_allocations...');
    
    // Verificar se a coluna já existe
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'telefonia' 
      AND TABLE_NAME = 'company' 
      AND COLUMN_NAME = 'phone_allocations'
    `);
    
    if (columns.length > 0) {
      console.log('✅ Coluna phone_allocations já existe na tabela company');
      return;
    }
    
    // Adicionar a coluna
    await connection.execute(`
      ALTER TABLE company 
      ADD COLUMN phone_allocations JSON NULL 
      COMMENT 'Alocações de linhas telefônicas para usuários específicos'
    `);
    
    console.log('✅ Migração 016 executada com sucesso!');
    console.log('✅ Coluna phone_allocations adicionada à tabela company');
    
    // Verificar se a coluna foi criada
    const [newColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'telefonia' 
      AND TABLE_NAME = 'company' 
      AND COLUMN_NAME = 'phone_allocations'
    `);
    
    if (newColumns.length > 0) {
      console.log('📋 Detalhes da coluna criada:', newColumns[0]);
    }
    
  } catch (error) {
    console.error('❌ Erro ao executar migração 016:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// Executar a migração
runMigration016()
  .then(() => {
    console.log('🎉 Migração 016 concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na migração 016:', error);
    process.exit(1);
  });

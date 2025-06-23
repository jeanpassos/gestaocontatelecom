const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Pegar o nome do arquivo da linha de comando
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.log('❌ Uso: node run-single-migration.js <nome-do-arquivo>');
  process.exit(1);
}

const connectionConfig = {
  host: process.env.DB_HOST || '201.91.93.55',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'telefonia',
  password: process.env.DB_PASSWORD || 'ZHADyZKreJLjh6RM',
  multipleStatements: true
};

async function runSingleMigration() {
  let connection;
  
  try {
    console.log('🔗 Conectando ao MariaDB...');
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Conectado com sucesso!');
    
    const migrationsPath = path.join(__dirname, '..', 'db', 'migrations', 'mariadb');
    const filePath = path.join(migrationsPath, migrationFile);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Arquivo não encontrado: ${migrationFile}`);
      return;
    }
    
    console.log(`📄 Executando migração: ${migrationFile}`);
    
    try {
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log('📝 SQL a ser executado:');
      console.log('─'.repeat(50));
      console.log(sql);
      console.log('─'.repeat(50));
      
      await connection.query(sql);
      console.log(`✅ ${migrationFile} executada com sucesso!`);
      
      // Verificar tabelas após execução
      const [tables] = await connection.query('USE telefonia; SHOW TABLES;');
      console.log('\n📊 Tabelas no banco após migração:');
      console.log(tables.map(row => Object.values(row)[0]));
      
    } catch (error) {
      console.log(`❌ Erro em ${migrationFile}:`);
      console.log('Mensagem:', error.message);
      console.log('Código:', error.code);
      if (error.sql) {
        console.log('SQL problemático:', error.sql.substring(0, 300));
      }
    }
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

runSingleMigration();

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionConfig = {
  host: process.env.DB_HOST || '201.91.93.55',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'telefonia',
  password: process.env.DB_PASSWORD || 'ZHADyZKreJLjh6RM',
  // Não especificar database inicialmente
  multipleStatements: true
};

const migrationFiles = [
  '001-initial-schema-mariadb.sql',
  '002-seed-data-mariadb.sql',
  '003-update-user-schema-mariadb.sql',
  '004-create-segment-table-mariadb.sql',
  '007-add-active-column-to-user-mariadb.sql',
  '008-add-segment-to-company-mariadb.sql',
  '009-add-fields-to-company-mariadb.sql',
  '010-create-provider-table-mariadb.sql',
  '011-seed-providers-data-mariadb.sql',
  '012-update-company-provider-relation-mariadb.sql',
  '013-create-contract-table-and-restructure-company-mariadb.sql'
];

async function runMigrations() {
  let connection;
  
  try {
    console.log('🔗 Conectando ao MariaDB...');
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Conectado com sucesso!');
    
    const migrationsPath = path.join(__dirname, '..', 'db', 'migrations', 'mariadb');
    
    for (const filename of migrationFiles) {
      const filePath = path.join(migrationsPath, filename);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Arquivo não encontrado: ${filename}`);
        continue;
      }
      
      console.log(`📄 Executando migração: ${filename}`);
      
      try {
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Usar query ao invés de execute para suportar múltiplas declarações
        await connection.query(sql);
        console.log(`✅ ${filename} executada com sucesso`);
        
      } catch (error) {
        console.log(`❌ Erro em ${filename}:`, error.message);
        // Log mais detalhado do erro
        if (error.sql) {
          console.log(`📝 SQL problemático: ${error.sql.substring(0, 200)}...`);
        }
      }
    }
    
    // Verificação final
    console.log('\n📊 Verificando tabelas criadas...');
    try {
      const [tables] = await connection.query('USE telefonia; SHOW TABLES;');
      console.log('Tabelas no banco:', tables.map(row => Object.values(row)[0]));
    } catch (error) {
      console.log('⚠️  Erro ao verificar tabelas:', error.message);
    }
    
    console.log('\n🎉 Processo de migração concluído!');
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

runMigrations();

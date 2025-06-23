const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration015() {
  const connection = await mysql.createConnection({
    host: '201.91.93.55',
    user: 'telefonia',
    password: 'ZHADyZKreJLjh6RM',
    database: 'telefonia'
  });

  try {
    console.log('🚀 Executando migração 015 - Restaurar campos da empresa...');
    
    // Ler arquivo da migração
    const migrationPath = path.join(__dirname, 'migrations', '015-restore-company-fields-mariadb.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Dividir por declarações (removendo comentários e linhas vazias)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`📝 Executando ${statements.length} declarações...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`[${i + 1}/${statements.length}] ${statement.substring(0, 60)}...`);
        try {
          await connection.query(statement);
          console.log(`✅ Declaração ${i + 1} executada com sucesso`);
        } catch (error) {
          // Se a coluna já existe, ignorar erro
          if (error.message.includes('Duplicate column name')) {
            console.log(`⚠️  Coluna já existe (ignorando): ${error.message}`);
          } else {
            console.error(`❌ Erro na declaração ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('🎉 Migração 015 executada com sucesso!');
    
    // Verificar estrutura da tabela company
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM company WHERE Field IN ('contract_date', 'renewal_date', 'type')
    `);
    
    console.log('📊 Colunas relacionadas na tabela company:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} (${col.Null})`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao executar migração 015:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration015();

const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Configuração da conexão
const connection = mysql.createConnection({
  host: '201.91.93.55',
  user: 'telefonia',
  password: 'ZHADyZKreJLjh6RM',
  database: 'telefonia',
  multipleStatements: true
});

async function runMigration() {
  try {
    console.log('🔧 Iniciando migração da tabela de permissões...');
    
    // Ler arquivo de migração
    const migrationPath = path.join(__dirname, 'db', 'migrations', '016-create-permissions-table-mariadb.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Executar migração
    console.log('📊 Executando migração 016...');
    
    connection.query(migrationSQL, (error, results) => {
      if (error) {
        console.error('❌ Erro na migração:', error);
        return;
      }
      
      console.log('✅ Migração 016 executada com sucesso!');
      console.log('📋 Tabela permissions criada e dados iniciais inseridos');
      
      // Verificar se tabela foi criada
      connection.query('DESCRIBE permissions', (error, results) => {
        if (error) {
          console.error('❌ Erro ao verificar tabela:', error);
        } else {
          console.log('✅ Estrutura da tabela permissions:');
          console.table(results);
        }
        
        // Verificar dados inseridos
        connection.query('SELECT role, COUNT(*) as total_permissions FROM permissions GROUP BY role', (error, results) => {
          if (error) {
            console.error('❌ Erro ao contar permissões:', error);
          } else {
            console.log('✅ Permissões por role:');
            console.table(results);
          }
          
          connection.end();
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    connection.end();
  }
}

runMigration();

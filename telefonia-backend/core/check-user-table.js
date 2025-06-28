const mysql = require('mysql2/promise');

const dbConfig = {
  host: '201.91.93.55',
  user: 'telefonia',
  password: 'ZHADyZKreJLjh6RM',
  database: 'telefonia'
};

async function checkUserTable() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 Verificando estrutura da tabela user...\n');
    
    // Verificar estrutura da tabela user
    const [columns] = await connection.execute('DESCRIBE user');
    
    console.log('📋 Colunas da tabela user:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
    });
    
    // Verificar se existem usuários
    const [users] = await connection.execute('SELECT id, name, email, role FROM user LIMIT 5');
    console.log(`\n👥 Usuários existentes: ${users.length}`);
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

checkUserTable();

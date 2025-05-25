const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração da conexão com o banco de dados
const dbConfig = {
  host: '201.91.93.55',
  port: 5432,
  database: 'telefonia',
  user: 'telefonia',
  password: '6T8Cs8dbNWAN',
  ssl: false
};

async function runMigrations() {
  const client = new Client(dbConfig);
  
  try {
    console.log('Conectando ao banco de dados...');
    await client.connect();
    console.log('Conexão estabelecida com sucesso!');
    
    // Ler e executar os scripts SQL na ordem
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Garante que os arquivos sejam executados em ordem alfabética
    
    for (const file of migrationFiles) {
      console.log(`Executando migração: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`✅ Migração ${file} aplicada com sucesso!`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Erro ao aplicar migração ${file}:`, error.message);
        throw error;
      }
    }
    
    console.log('🎉 Todas as migrações foram aplicadas com sucesso!');
  } catch (error) {
    console.error('Erro ao executar migrações:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();

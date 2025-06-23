const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 VERIFICAÇÃO DEFINITIVA: MARIADB vs POSTGRESQL');
  console.log('================================================');
  
  const config = {
    host: process.env.DB_HOST || '201.91.93.55',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'telefonia',
    password: process.env.DB_PASSWORD || 'ZHADyZKreJLjh6RM',
    database: process.env.DB_DATABASE || 'telefonia',
  };
  
  console.log('📋 Configuração sendo testada:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  console.log('');
  
  let connection;
  
  try {
    console.log('🔗 Tentando conectar ao MariaDB...');
    connection = await mysql.createConnection(config);
    console.log('✅ CONEXÃO MARIADB ESTABELECIDA COM SUCESSO!');
    
    // Teste 1: Verificar versão do banco
    console.log('\n📊 Teste 1: Verificando versão do banco...');
    const [version] = await connection.query('SELECT VERSION() as version');
    console.log(`   Versão: ${version[0].version}`);
    
    // Teste 2: Listar tabelas
    console.log('\n📊 Teste 2: Listando tabelas no banco...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`   Tabelas encontradas (${tables.length}):`);
    tables.forEach(row => {
      console.log(`   - ${Object.values(row)[0]}`);
    });
    
    // Teste 3: Contar registros em uma tabela
    console.log('\n📊 Teste 3: Testando consulta em tabela...');
    try {
      const [companyCount] = await connection.query('SELECT COUNT(*) as count FROM company');
      console.log(`   Empresas no banco: ${companyCount[0].count}`);
      
      const [userCount] = await connection.query('SELECT COUNT(*) as count FROM user');
      console.log(`   Usuários no banco: ${userCount[0].count}`);
    } catch (queryError) {
      console.log(`   ❌ Erro ao consultar tabelas: ${queryError.message}`);
    }
    
    // Teste 4: Verificar se é realmente MariaDB
    console.log('\n📊 Teste 4: Confirmando tipo do banco...');
    try {
      const [info] = await connection.query(`
        SELECT 
          @@version_comment as comment,
          @@version as version,
          DATABASE() as current_db
      `);
      console.log(`   Comentário da versão: ${info[0].comment}`);
      console.log(`   Versão completa: ${info[0].version}`);
      console.log(`   Banco atual: ${info[0].current_db}`);
      
      if (info[0].comment.toLowerCase().includes('mariadb')) {
        console.log('   ✅ CONFIRMADO: É MARIADB!');
      } else {
        console.log('   ⚠️  ATENÇÃO: Pode não ser MariaDB!');
      }
    } catch (infoError) {
      console.log(`   ❌ Erro ao verificar info: ${infoError.message}`);
    }
    
    console.log('\n🎉 RESULTADO: O SISTEMA ESTÁ CONECTADO AO MARIADB!');
    
  } catch (error) {
    console.log('❌ FALHA NA CONEXÃO MARIADB!');
    console.log(`   Erro: ${error.message}`);
    console.log('\n🔍 Verificando se ainda está usando PostgreSQL...');
    
    // Tentar conexão PostgreSQL como fallback
    try {
      const { Client } = require('pg');
      const pgClient = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'password',
        database: 'telefonia',
      });
      
      await pgClient.connect();
      console.log('⚠️  ATENÇÃO: SISTEMA AINDA ESTÁ USANDO POSTGRESQL!');
      await pgClient.end();
    } catch (pgError) {
      console.log('❌ PostgreSQL também não conectou. Sistema pode estar com problemas.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

testConnection();

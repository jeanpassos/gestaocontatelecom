/**
 * Script para verificar se a tabela de permissões existe no banco
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkPermissionsTable() {
  console.log('Verificando tabela de permissões no banco de dados...');
  
  // Configuração da conexão MariaDB usando variáveis de ambiente
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });

  try {
    // Verificar se a tabela existe
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'permissions'`,
      [process.env.DB_DATABASE]
    );
    
    if (tables.length > 0) {
      console.log('✅ Tabela "permissions" encontrada no banco de dados!');
      
      // Contar registros
      const [countResult] = await connection.query('SELECT COUNT(*) as count FROM permissions');
      console.log(`✅ Registros na tabela: ${countResult[0].count}`);
      
      // Mostrar estrutura
      const [columns] = await connection.query(
        `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT 
         FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'permissions'
         ORDER BY ORDINAL_POSITION`,
        [process.env.DB_DATABASE]
      );
      
      console.log('\nEstrutura da tabela "permissions":');
      console.table(columns);
      
      // Mostrar alguns registros de exemplo
      const [samples] = await connection.query('SELECT * FROM permissions LIMIT 5');
      console.log('\nExemplos de registros:');
      console.table(samples);
      
    } else {
      console.log('❌ A tabela "permissions" NÃO foi encontrada no banco de dados!');
      
      // Mostrar todas as tabelas existentes
      const [allTables] = await connection.query(
        `SELECT TABLE_NAME FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = ?`,
        [process.env.DB_DATABASE]
      );
      
      console.log('\nTabelas existentes no banco:');
      console.table(allTables.map(t => t.TABLE_NAME));
    }
  } catch (error) {
    console.error('Erro ao verificar tabela:', error.message);
  } finally {
    await connection.end();
    console.log('\nVerificação concluída.');
  }
}

checkPermissionsTable().catch(console.error);

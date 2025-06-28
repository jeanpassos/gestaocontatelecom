/**
 * Script para executar a migração da tabela de permissões no MariaDB
 * Este script executa a migração 015-create-permissions-table-mariadb.sql
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function runMigration() {
  console.log('Iniciando migração de permissões...');
  
  // Configuração da conexão MariaDB usando variáveis de ambiente
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: true  // Importante para executar múltiplos comandos SQL
  });

  try {
    // Ler arquivo SQL
    const migrationPath = path.resolve(__dirname, '../../db/migrations/015-create-permissions-table-mariadb.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executando migração...');
    const [results] = await connection.query(sqlContent);
    console.log('Migração executada com sucesso!');
    console.log('Tabela "permissions" criada e dados iniciais inseridos.');
    
    // Verificar se a tabela foi criada corretamente
    const [tables] = await connection.query('SHOW TABLES LIKE "permissions"');
    if (tables.length > 0) {
      console.log('✅ Tabela "permissions" confirmada no banco de dados');
      
      // Contar registros inseridos
      const [countResult] = await connection.query('SELECT COUNT(*) as count FROM permissions');
      console.log(`✅ ${countResult[0].count} permissões inseridas no banco`);
    } else {
      console.log('⚠️ A tabela "permissions" não foi encontrada no banco de dados');
    }
  } catch (error) {
    console.error('Erro ao executar a migração:', error.message);
    
    // Verificar se é erro de tabela já existente
    if (error.message.includes('already exists')) {
      console.log('A tabela "permissions" já existe. Tentando inserir apenas os dados...');
      
      try {
        // Tentativa de executar apenas os inserts
        const migrationPath = path.resolve(__dirname, '../../db/migrations/015-create-permissions-table-mariadb.sql');
        const sqlContent = fs.readFileSync(migrationPath, 'utf8');
        
        // Extrair apenas os inserts
        const insertStatements = sqlContent.split('\n')
          .filter(line => line.trim().startsWith('INSERT INTO'))
          .join('\n');
        
        console.log('Executando apenas os INSERT statements...');
        await connection.query(insertStatements);
        console.log('Dados inseridos com sucesso!');
        
        const [countResult] = await connection.query('SELECT COUNT(*) as count FROM permissions');
        console.log(`✅ ${countResult[0].count} permissões inseridas no banco`);
      } catch (insertError) {
        console.error('Erro ao inserir dados:', insertError.message);
      }
    }
  } finally {
    await connection.end();
    console.log('Conexão com o banco de dados encerrada');
  }
}

runMigration().catch(console.error);

const { Client } = require('pg');
// const fs = require('fs'); // fs e path não são mais necessários para este script
// const path = require('path');

// Configuração da conexão com o banco de dados (mesma do run-migrations.js)
const dbConfig = {
  host: '201.91.93.55',
  port: 5432,
  database: 'telefonia',
  user: 'telefonia',
  password: '6T8Cs8dbNWAN',
  ssl: false,
};

async function inspectSchema() {
  const client = new Client(dbConfig);

  try {
    console.log('Conectando ao banco de dados para inspeção...');
    await client.connect();
    console.log('Conexão estabelecida com sucesso!');

    console.log('\\n--- Tabelas no esquema "telefonia" ---');
    const tablesResult = await client.query(
      "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'telefonia' ORDER BY tablename;",
    );
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach((row) => console.log(row.tablename));
    } else {
      console.log('Nenhuma tabela encontrada no esquema "telefonia".');
    }

    const targetTable = 'segment';
    console.log(
      '\\n--- Colunas na tabela "' +
        targetTable +
        '" (esquema "telefonia") --- ',
    );
    const columnsResult = await client.query(
      'SELECT column_name, data_type, is_nullable, column_default, character_maximum_length, udt_name ' +
        'FROM information_schema.columns ' +
        "WHERE table_schema = 'telefonia' AND table_name = $1 " +
        'ORDER BY ordinal_position;',
      [targetTable],
    );

    if (columnsResult.rows.length > 0) {
      console.table(columnsResult.rows);
    } else {
      console.log(
        'Tabela "' +
          targetTable +
          '" não encontrada ou não possui colunas no esquema "telefonia".',
      );
    }
  } catch (error) {
    console.error(
      'Erro ao inspecionar o esquema do banco de dados:',
      error.message,
    );
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('\\nInspeção do esquema finalizada.');
  }
}

inspectSchema();

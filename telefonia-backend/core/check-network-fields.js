const mysql = require('mysql2/promise');

async function checkNetworkFields() {
  const connection = await mysql.createConnection({
    host: '201.91.93.55',
    user: 'telefonia',
    password: 'ZHADyZKreJLjh6RM',
    database: 'telefonia'
  });

  try {
    console.log('🔍 Verificando onde estão os campos de rede...\n');
    
    // Verificar estrutura da tabela company
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM company
    `);
    
    console.log('📊 Colunas da tabela company:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\n🔍 Verificando dados da empresa cadastrada...\n');
    
    // Buscar dados completos da empresa
    const [companies] = await connection.query(`
      SELECT id, corporate_name, assets, phone_lines
      FROM company 
      WHERE corporate_name = 'GRUPO DE TECNOLOGIA JM LTDA'
    `);
    
    if (companies.length > 0) {
      const company = companies[0];
      console.log(`✅ Empresa encontrada: ${company.corporate_name}`);
      console.log(`ID: ${company.id}`);
      
      // Verificar campo assets (onde provavelmente estão os dados de rede)
      if (company.assets) {
        console.log('\n📊 ASSETS (dados JSON):');
        console.log(JSON.stringify(company.assets, null, 2));
      } else {
        console.log('\n❌ Campo assets está NULL ou vazio');
      }
      
      // Verificar phone_lines
      if (company.phone_lines) {
        console.log('\n📞 PHONE LINES:');
        console.log(JSON.stringify(company.phone_lines, null, 2));
      } else {
        console.log('\n❌ Campo phone_lines está NULL ou vazio');
      }
      
    } else {
      console.log('❌ Empresa não encontrada');
    }
    
    // Verificar se existe tabela separada para dados de rede
    console.log('\n🔍 Verificando outras tabelas...\n');
    
    const [tables] = await connection.query(`
      SHOW TABLES LIKE '%network%' OR SHOW TABLES LIKE '%internet%' OR SHOW TABLES LIKE '%ip%'
    `);
    
    if (tables.length > 0) {
      console.log('📊 Tabelas relacionadas a rede encontradas:');
      tables.forEach(table => {
        console.log(`- ${Object.values(table)[0]}`);
      });
    } else {
      console.log('❌ Nenhuma tabela específica de rede encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

checkNetworkFields();

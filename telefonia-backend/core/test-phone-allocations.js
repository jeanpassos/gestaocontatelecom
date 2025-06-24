const mysql = require('mysql2/promise');

async function testPhoneAllocations() {
  const connection = await mysql.createConnection({
    host: '201.91.93.55',
    user: 'telefonia',
    password: 'ZHADyZKreJLjh6RM',
    database: 'telefonia',
    multipleStatements: false
  });

  try {
    console.log('🔍 Testando funcionalidade de alocação de telefones...\n');
    
    // 1. Verificar se a coluna phone_allocations existe
    console.log('1. Verificando coluna phone_allocations...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'telefonia' 
      AND TABLE_NAME = 'company' 
      AND COLUMN_NAME = 'phone_allocations'
    `);
    
    if (columns.length > 0) {
      console.log('✅ Coluna phone_allocations existe:', columns[0]);
    } else {
      console.log('❌ Coluna phone_allocations NÃO existe');
      return;
    }
    
    // 2. Buscar empresas existentes
    console.log('\n2. Buscando empresas existentes...');
    const [companies] = await connection.execute(`
      SELECT id, corporate_name, phone_lines, phone_allocations 
      FROM company 
      WHERE phone_lines IS NOT NULL 
      LIMIT 3
    `);
    
    console.log(`📋 Encontradas ${companies.length} empresas:`);
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.corporate_name}`);
      console.log(`      ID: ${company.id}`);
      console.log(`      Phone Lines: ${company.phone_lines || 'null'}`);
      console.log(`      Phone Allocations: ${company.phone_allocations || 'null'}`);
    });
    
    if (companies.length === 0) {
      console.log('⚠️  Nenhuma empresa com linhas telefônicas encontrada');
      return;
    }
    
    // 3. Teste de inserção de alocações
    const testCompany = companies[0];
    console.log(`\n3. Testando alocação na empresa: ${testCompany.corporate_name}`);
    
    // Buscar usuários para alocar
    const [users] = await connection.execute(`
      SELECT id, name, email FROM user LIMIT 2
    `);
    
    if (users.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado para testar alocação');
      return;
    }
    
    // Criar alocações de teste
    const testAllocations = [
      {
        phoneLineIndex: 0,
        phoneLine: '(11) 98765-4321',
        userId: users[0].id,
        userName: users[0].name || users[0].email,
        allocatedDate: new Date().toISOString()
      }
    ];
    
    if (users.length > 1) {
      testAllocations.push({
        phoneLineIndex: 1,
        phoneLine: '(11) 98765-4322',
        userId: users[1].id,
        userName: users[1].name || users[1].email,
        allocatedDate: new Date().toISOString()
      });
    }
    
    console.log('📝 Alocações de teste a serem inseridas:');
    testAllocations.forEach((alloc, index) => {
      console.log(`   ${index + 1}. Linha ${alloc.phoneLine} → ${alloc.userName}`);
    });
    
    // Atualizar empresa com alocações
    await connection.execute(`
      UPDATE company 
      SET phone_allocations = ? 
      WHERE id = ?
    `, [JSON.stringify(testAllocations), testCompany.id]);
    
    console.log('✅ Alocações inseridas no banco de dados');
    
    // 4. Verificar se a inserção funcionou
    console.log('\n4. Verificando alocações inseridas...');
    const [updatedCompany] = await connection.execute(`
      SELECT id, corporate_name, phone_allocations 
      FROM company 
      WHERE id = ?
    `, [testCompany.id]);
    
    if (updatedCompany.length > 0) {
      const allocations = JSON.parse(updatedCompany[0].phone_allocations || '[]');
      console.log('📋 Alocações recuperadas do banco:');
      console.log(JSON.stringify(allocations, null, 2));
      
      if (allocations.length > 0) {
        console.log('✅ Funcionalidade de alocação está funcionando corretamente!');
      } else {
        console.log('⚠️  Nenhuma alocação encontrada após inserção');
      }
    }
    
    // 5. Teste de API endpoint
    console.log('\n5. Testando endpoint da API...');
    console.log('ℹ️  Para testar completamente, acesse o frontend em:');
    console.log('   http://localhost:3000');
    console.log('   - Edite uma empresa');
    console.log('   - Na seção de linhas telefônicas, aloque usuários');
    console.log('   - Salve e visualize os detalhes da empresa');
    
    console.log('\n🎉 Teste de alocação de telefones concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await connection.end();
  }
}

// Executar o teste
testPhoneAllocations()
  .then(() => {
    console.log('\n✅ Teste finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha no teste:', error);
    process.exit(1);
  });

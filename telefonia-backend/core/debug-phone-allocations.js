const mysql = require('mysql2/promise');

async function debugPhoneAllocations() {
  const connection = await mysql.createConnection({
    host: '201.91.93.55',
    user: 'telefonia',
    password: 'ZHADyZKreJLjh6RM',
    database: 'telefonia',
    multipleStatements: false
  });

  try {
    console.log('🔍 Investigando problema com phone_allocations...\n');
    
    // 1. Verificar o que está salvo atualmente
    console.log('1. Verificando dados atuais...');
    const [companies] = await connection.execute(`
      SELECT id, corporate_name, phone_allocations, 
             LENGTH(phone_allocations) as length,
             phone_allocations IS NULL as is_null
      FROM company 
      WHERE phone_allocations IS NOT NULL
      LIMIT 3
    `);
    
    console.log('📋 Empresas com phone_allocations:');
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.corporate_name}`);
      console.log(`      ID: ${company.id}`);
      console.log(`      phone_allocations (raw): ${company.phone_allocations}`);
      console.log(`      Comprimento: ${company.length}`);
      console.log(`      É null: ${company.is_null}`);
      console.log(`      Tipo: ${typeof company.phone_allocations}`);
    });
    
    // 2. Limpar e testar com JSON válido
    console.log('\n2. Limpando dados e testando com JSON válido...');
    
    // Pegar a primeira empresa para teste
    const testCompany = companies[0];
    if (!testCompany) {
      console.log('❌ Nenhuma empresa encontrada para teste');
      return;
    }
    
    // Buscar usuários
    const [users] = await connection.execute(`
      SELECT id, name, email FROM user LIMIT 2
    `);
    
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado');
      return;
    }
    
    // Criar JSON válido
    const validAllocations = [
      {
        phoneLineIndex: 0,
        phoneLine: "(11) 98765-4321",
        userId: users[0].id,
        userName: users[0].name || users[0].email,
        allocatedDate: new Date().toISOString()
      }
    ];
    
    if (users.length > 1) {
      validAllocations.push({
        phoneLineIndex: 1,
        phoneLine: "(11) 98765-4322", 
        userId: users[1].id,
        userName: users[1].name || users[1].email,
        allocatedDate: new Date().toISOString()
      });
    }
    
    const jsonString = JSON.stringify(validAllocations);
    console.log('📝 JSON válido a ser inserido:');
    console.log(jsonString);
    
    // 3. Primeiro limpar o campo
    console.log('\n3. Limpando campo phone_allocations...');
    await connection.execute(`
      UPDATE company 
      SET phone_allocations = NULL 
      WHERE id = ?
    `, [testCompany.id]);
    
    // 4. Inserir JSON válido usando prepared statement
    console.log('4. Inserindo JSON válido...');
    await connection.execute(`
      UPDATE company 
      SET phone_allocations = ?
      WHERE id = ?
    `, [jsonString, testCompany.id]);
    
    // 5. Verificar se foi salvo corretamente
    console.log('5. Verificando resultado...');
    const [result] = await connection.execute(`
      SELECT id, corporate_name, phone_allocations,
             JSON_VALID(phone_allocations) as is_valid_json
      FROM company 
      WHERE id = ?
    `, [testCompany.id]);
    
    if (result.length > 0) {
      const company = result[0];
      console.log('📋 Resultado da verificação:');
      console.log(`   Empresa: ${company.corporate_name}`);
      console.log(`   phone_allocations (raw): ${company.phone_allocations}`);
      console.log(`   É JSON válido: ${company.is_valid_json}`);
      console.log(`   Tipo: ${typeof company.phone_allocations}`);
      
      // Tentar fazer parse
      try {
        let allocations;
        if (typeof company.phone_allocations === 'string') {
          allocations = JSON.parse(company.phone_allocations);
        } else {
          // Se já é um objeto, usar diretamente
          allocations = company.phone_allocations;
        }
        
        console.log('✅ Parse do JSON bem-sucedido:');
        console.log(JSON.stringify(allocations, null, 2));
        
        console.log('\n🎉 Funcionalidade de phone_allocations funcionando!');
        
      } catch (parseError) {
        console.log('❌ Erro no parse do JSON:', parseError.message);
        console.log('   Valor retornado:', company.phone_allocations);
      }
    }
    
    // 6. Testar via API se possível
    console.log('\n6. Próximos passos para teste completo:');
    console.log('   • Acesse http://localhost:3000');
    console.log('   • Edite uma empresa');
    console.log('   • Aloque usuários nas linhas telefônicas');
    console.log('   • Salve e visualize os detalhes');
    
  } catch (error) {
    console.error('❌ Erro durante o debug:', error);
  } finally {
    await connection.end();
  }
}

// Executar o debug
debugPhoneAllocations()
  .then(() => {
    console.log('\n✅ Debug finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha no debug:', error);
    process.exit(1);
  });

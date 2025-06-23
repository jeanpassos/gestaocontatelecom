const mysql = require('mysql2/promise');

async function testUsersCompanies() {
  const connection = await mysql.createConnection({
    host: '201.91.93.55',
    user: 'telefonia',
    password: 'ZHADyZKreJLjh6RM',
    database: 'telefonia'
  });

  try {
    console.log('🔗 Testando usuários e empresas...');
    
    // Verificar total de empresas
    const [companies] = await connection.query(`
      SELECT COUNT(*) as total FROM company
    `);
    console.log(`📊 Total de empresas: ${companies[0].total}`);
    
    // Verificar total de usuários
    const [users] = await connection.query(`
      SELECT COUNT(*) as total FROM user
    `);
    console.log(`👥 Total de usuários: ${users[0].total}`);
    
    // Verificar usuários com empresa
    const [usersWithCompany] = await connection.query(`
      SELECT COUNT(*) as total FROM user WHERE company_id IS NOT NULL
    `);
    console.log(`🏢 Usuários vinculados a empresas: ${usersWithCompany[0].total}`);
    
    // Verificar usuários por empresa
    const [usersByCompany] = await connection.query(`
      SELECT 
        c.corporate_name,
        COUNT(u.id) as user_count
      FROM company c
      LEFT JOIN user u ON u.company_id = c.id
      GROUP BY c.id, c.corporate_name
      ORDER BY user_count DESC
      LIMIT 10
    `);
    
    console.log('📋 Usuários por empresa:');
    usersByCompany.forEach(row => {
      console.log(`- ${row.corporate_name}: ${row.user_count} usuários`);
    });
    
    // Verificar detalhes dos usuários vinculados
    const [userDetails] = await connection.query(`
      SELECT 
        u.email,
        u.name,
        u.role,
        c.corporate_name
      FROM user u
      JOIN company c ON u.company_id = c.id
      LIMIT 10
    `);
    
    console.log('👤 Detalhes dos usuários vinculados:');
    userDetails.forEach(user => {
      console.log(`- ${user.email} (${user.name || 'Sem nome'}) - ${user.role} → ${user.corporate_name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

testUsersCompanies();

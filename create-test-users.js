const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
  host: '201.91.93.55',
  user: 'telefonia',
  password: 'ZHADyZKreJLjh6RM',
  database: 'telefonia'
};

async function createTestUsers() {
  const connection = await mysql.createConnection(dbConfig);
  
  console.log('🔧 Criando usuários de teste para validar sistema de permissões...\n');
  
  try {
    // Hash para senha padrão "test123"
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // Verificar empresa de exemplo para vincular usuários
    const [companies] = await connection.execute('SELECT id FROM company LIMIT 1');
    const companyId = companies.length > 0 ? companies[0].id : null;
    
    // Usuários de teste para cada perfil
    const testUsers = [
      {
        name: 'Admin Teste',
        email: 'admin.teste@sistema.com',
        role: 'admin',
        companyId: null // Admins não precisam de empresa
      },
      {
        name: 'Supervisor Teste',
        email: 'supervisor.teste@sistema.com',
        role: 'supervisor',
        companyId: companyId
      },
      {
        name: 'Consultor Teste',
        email: 'consultor.teste@sistema.com',
        role: 'consultant',
        companyId: companyId
      },
      {
        name: 'Cliente Teste',
        email: 'cliente.teste@sistema.com',
        role: 'client',
        companyId: companyId
      }
    ];
    
    for (const user of testUsers) {
      // Verificar se usuário já existe
      const [existing] = await connection.execute(
        'SELECT id FROM user WHERE email = ?',
        [user.email]
      );
      
      if (existing.length === 0) {
        // Criar usuário
        const [result] = await connection.execute(`
          INSERT INTO user (name, email, password, role, company_id, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
        `, [user.name, user.email, hashedPassword, user.role, user.companyId]);
        
        console.log(`✅ Usuário criado: ${user.name} (${user.email}) - Role: ${user.role}`);
      } else {
        console.log(`⚠️  Usuário já existe: ${user.email}`);
      }
    }
    
    console.log('\n🎉 Usuários de teste criados com sucesso!');
    console.log('\n📋 **Credenciais para teste:**');
    console.log('   Email: admin.teste@sistema.com | Senha: test123 | Perfil: Administrador');
    console.log('   Email: supervisor.teste@sistema.com | Senha: test123 | Perfil: Supervisor');
    console.log('   Email: consultor.teste@sistema.com | Senha: test123 | Perfil: Consultor');
    console.log('   Email: cliente.teste@sistema.com | Senha: test123 | Perfil: Cliente');
    
    console.log('\n🧪 **Próximos passos para teste:**');
    console.log('1. Faça login com cada usuário');
    console.log('2. Verifique se cada perfil acessa apenas suas páginas permitidas');
    console.log('3. Teste a matriz de permissões na aba Admin > Permissões');
    console.log('4. Valide os controles de acesso nas rotas');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error.message);
  } finally {
    await connection.end();
  }
}

createTestUsers();

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function createTestAdmin() {
  console.log('🔧 Criando usuário admin para teste...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '201.91.93.55',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'telefonia',
    password: process.env.DB_PASSWORD || 'ZHADyZKreJLjh6RM',
    database: process.env.DB_DATABASE || 'telefonia',
  });

  try {
    // Senha de teste: "admin123"
    const testPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    // Verificar se já existe empresa
    const [companies] = await connection.query('SELECT id FROM company LIMIT 1');
    let companyId;
    
    if (companies.length === 0) {
      // Criar empresa se não existir
      companyId = uuidv4();
      await connection.query(
        'INSERT INTO company (id, cnpj, corporate_name) VALUES (?, ?, ?)',
        [companyId, '12345678000195', 'Empresa Teste Ltda']
      );
      console.log('✅ Empresa teste criada');
    } else {
      companyId = companies[0].id;
      console.log('✅ Usando empresa existente');
    }

    // Remover usuário admin existente se houver
    await connection.query('DELETE FROM user WHERE email = ?', ['admin@teste.com']);
    
    // Criar novo usuário admin
    const adminId = uuidv4();
    await connection.query(
      `INSERT INTO user (id, email, password, role, company_id, name, active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [adminId, 'admin@teste.com', hashedPassword, 'admin', companyId, 'Admin Teste', true]
    );

    console.log('🎉 Usuário admin criado com sucesso!');
    console.log('');
    console.log('📋 CREDENCIAIS PARA TESTE:');
    console.log('   Email: admin@teste.com');
    console.log('   Senha: admin123');
    console.log('');
    console.log('🌐 Acesse: http://localhost:3001');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error.message);
  } finally {
    await connection.end();
  }
}

createTestAdmin();

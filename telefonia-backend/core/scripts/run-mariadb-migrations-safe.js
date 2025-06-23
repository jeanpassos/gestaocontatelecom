const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionConfig = {
  host: process.env.DB_HOST || '201.91.93.55',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'telefonia',
  password: process.env.DB_PASSWORD || 'ZHADyZKreJLjh6RM',
  database: 'telefonia',
  multipleStatements: true
};

async function checkColumnExists(connection, tableName, columnName) {
  try {
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'telefonia' 
      AND TABLE_NAME = ? 
      AND COLUMN_NAME = ?
    `, [tableName, columnName]);
    return columns.length > 0;
  } catch (error) {
    return false;
  }
}

async function checkIndexExists(connection, tableName, indexName) {
  try {
    const [indexes] = await connection.query(`
      SELECT INDEX_NAME 
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = 'telefonia' 
      AND TABLE_NAME = ? 
      AND INDEX_NAME = ?
    `, [tableName, indexName]);
    return indexes.length > 0;
  } catch (error) {
    return false;
  }
}

async function checkTableExists(connection, tableName) {
  try {
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'telefonia' 
      AND TABLE_NAME = ?
    `, [tableName]);
    return tables.length > 0;
  } catch (error) {
    return false;
  }
}

async function runSpecificMigrations() {
  let connection;
  
  try {
    console.log('🔗 Conectando ao MariaDB...');
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Conectado com sucesso!');
    
    // Garantir que estamos no banco telefonia
    await connection.query('USE telefonia');
    
    // Executar migrações 003, 004, 007, 009, 010, 011, 012, 013 de forma segura
    
    // === MIGRAÇÃO 003: Update User Schema ===
    console.log('\n📄 Executando migração 003 (Update User Schema)...');
    
    // Verificar se tabela user existe
    const userExists = await checkTableExists(connection, 'user');
    if (!userExists) {
      console.log('⚠️  Tabela user não existe. Pulando migração 003.');
    } else {
      // Adicionar coluna name se não existir
      const nameExists = await checkColumnExists(connection, 'user', 'name');
      if (!nameExists) {
        await connection.query('ALTER TABLE user ADD COLUMN name VARCHAR(255)');
        console.log('  ✅ Coluna name adicionada');
      } else {
        console.log('  ⏭️  Coluna name já existe');
      }
      
      // Adicionar coluna phone se não existir
      const phoneExists = await checkColumnExists(connection, 'user', 'phone');
      if (!phoneExists) {
        await connection.query('ALTER TABLE user ADD COLUMN phone VARCHAR(20)');
        console.log('  ✅ Coluna phone adicionada');
      } else {
        console.log('  ⏭️  Coluna phone já existe');
      }
      
      // Atualizar enum role
      try {
        await connection.query(`ALTER TABLE user MODIFY COLUMN role ENUM('admin', 'supervisor', 'client', 'consultant') NOT NULL DEFAULT 'client'`);
        console.log('  ✅ Enum role atualizado');
      } catch (error) {
        console.log('  ⚠️  Erro ao atualizar enum role:', error.message);
      }
    }
    
    // Criar tabela pending_document se não existir
    const pendingDocExists = await checkTableExists(connection, 'pending_document');
    if (!pendingDocExists) {
      await connection.query(`
        CREATE TABLE pending_document (
          id VARCHAR(36) PRIMARY KEY,
          company_id VARCHAR(36) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          file_size BIGINT NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          uploaded_by_id VARCHAR(36) NOT NULL,
          processing_status ENUM('pending', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'pending',
          error_message TEXT,
          processed_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT FK_pending_document_company FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE,
          CONSTRAINT FK_pending_document_uploaded_by FOREIGN KEY (uploaded_by_id) REFERENCES user(id) ON DELETE CASCADE
        )
      `);
      console.log('  ✅ Tabela pending_document criada');
      
      // Criar índices
      await connection.query('CREATE INDEX idx_pending_document_company ON pending_document(company_id)');
      await connection.query('CREATE INDEX idx_pending_document_uploaded_by ON pending_document(uploaded_by_id)');
      await connection.query('CREATE INDEX idx_pending_document_processing_status ON pending_document(processing_status)');
      console.log('  ✅ Índices pending_document criados');
    } else {
      console.log('  ⏭️  Tabela pending_document já existe');
    }
    
    // === MIGRAÇÃO 004: Segment Table ===
    console.log('\n📄 Executando migração 004 (Segment Table)...');
    
    const segmentExists = await checkTableExists(connection, 'segment');
    if (!segmentExists) {
      await connection.query(`
        CREATE TABLE segment (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('  ✅ Tabela segment criada');
    } else {
      console.log('  ⏭️  Tabela segment já existe');
    }
    
    // === MIGRAÇÃO 007: Active Column ===
    console.log('\n📄 Executando migração 007 (Active Column)...');
    
    const activeExists = await checkColumnExists(connection, 'user', 'active');
    if (!activeExists) {
      await connection.query('ALTER TABLE user ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE');
      console.log('  ✅ Coluna active adicionada');
    } else {
      console.log('  ⏭️  Coluna active já existe');
    }
    
    // === MIGRAÇÃO 009: Company Fields ===
    console.log('\n📄 Executando migração 009 (Company Fields)...');
    
    const fieldsToAdd = [
      { name: 'provider', type: "ENUM('vivo', 'claro', 'tim', 'oi', 'other') NULL" },
      { name: 'type', type: "ENUM('matriz', 'filial') NOT NULL DEFAULT 'matriz'" },
      { name: 'contract_date', type: 'DATE NULL' },
      { name: 'renewal_date', type: 'DATE NULL' },
      { name: 'observation', type: 'TEXT NULL' },
      { name: 'address', type: 'JSON NULL' },
      { name: 'manager', type: 'JSON NULL' }
    ];
    
    for (const field of fieldsToAdd) {
      const exists = await checkColumnExists(connection, 'company', field.name);
      if (!exists) {
        await connection.query(`ALTER TABLE company ADD COLUMN ${field.name} ${field.type}`);
        console.log(`  ✅ Coluna ${field.name} adicionada`);
      } else {
        console.log(`  ⏭️  Coluna ${field.name} já existe`);
      }
    }
    
    // === MIGRAÇÃO 010: Provider Table ===
    console.log('\n📄 Executando migração 010 (Provider Table)...');
    
    const providerExists = await checkTableExists(connection, 'provider');
    if (!providerExists) {
      await connection.query(`
        CREATE TABLE provider (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('  ✅ Tabela provider criada');
    } else {
      console.log('  ⏭️  Tabela provider já existe');
    }
    
    // === MIGRAÇÃO 011: Seed Providers ===
    console.log('\n📄 Executando migração 011 (Seed Providers)...');
    
    const [providerCount] = await connection.query('SELECT COUNT(*) as count FROM provider');
    if (providerCount[0].count === 0) {
      await connection.query(`
        INSERT INTO provider (id, name) VALUES
        ('550e8400-e29b-41d4-a716-446655440001', 'Vivo'),
        ('550e8400-e29b-41d4-a716-446655440002', 'Claro'),
        ('550e8400-e29b-41d4-a716-446655440003', 'TIM'),
        ('550e8400-e29b-41d4-a716-446655440004', 'Oi'),
        ('550e8400-e29b-41d4-a716-446655440005', 'Outros')
        ON DUPLICATE KEY UPDATE name = VALUES(name)
      `);
      console.log('  ✅ Dados de providers inseridos');
    } else {
      console.log('  ⏭️  Providers já existem');
    }
    
    // === MIGRAÇÃO 012: Company Provider Relation ===
    console.log('\n📄 Executando migração 012 (Company Provider Relation)...');
    
    // Remover coluna provider antiga se existir
    const oldProviderExists = await checkColumnExists(connection, 'company', 'provider');
    if (oldProviderExists) {
      await connection.query('ALTER TABLE company DROP COLUMN provider');
      console.log('  ✅ Coluna provider antiga removida');
    }
    
    // Adicionar nova coluna telephony_provider_id
    const newProviderExists = await checkColumnExists(connection, 'company', 'telephony_provider_id');
    if (!newProviderExists) {
      await connection.query('ALTER TABLE company ADD COLUMN telephony_provider_id VARCHAR(36) NULL');
      console.log('  ✅ Coluna telephony_provider_id adicionada');
      
      // Adicionar foreign key
      try {
        await connection.query(`
          ALTER TABLE company ADD CONSTRAINT FK_company_telephony_provider 
          FOREIGN KEY (telephony_provider_id) REFERENCES provider(id) 
          ON DELETE SET NULL ON UPDATE CASCADE
        `);
        console.log('  ✅ Foreign key adicionada');
      } catch (error) {
        console.log('  ⚠️  Erro ao adicionar foreign key:', error.message);
      }
    } else {
      console.log('  ⏭️  Coluna telephony_provider_id já existe');
    }
    
    // === MIGRAÇÃO 013: Contract Table ===
    console.log('\n📄 Executando migração 013 (Contract Table)...');
    
    const contractExists = await checkTableExists(connection, 'contract');
    if (!contractExists) {
      await connection.query(`
        CREATE TABLE contract (
          id VARCHAR(36) NOT NULL,
          company_id VARCHAR(36) NOT NULL,
          provider_id VARCHAR(36) NOT NULL,
          contract_number VARCHAR(100),
          phone_lines JSON,
          contract_date DATE,
          renewal_date DATE,
          monthly_fee DECIMAL(10,2),
          status VARCHAR(50) NOT NULL DEFAULT 'pending',
          observation TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT PK_contract_id PRIMARY KEY (id),
          CONSTRAINT FK_contract_company FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT FK_contract_provider FOREIGN KEY (provider_id) REFERENCES provider(id) ON DELETE RESTRICT ON UPDATE CASCADE
        )
      `);
      console.log('  ✅ Tabela contract criada');
      
      // Criar índices
      await connection.query('CREATE INDEX IDX_contract_company_id ON contract (company_id)');
      await connection.query('CREATE INDEX IDX_contract_provider_id ON contract (provider_id)');
      console.log('  ✅ Índices contract criados');
    } else {
      console.log('  ⏭️  Tabela contract já existe');
    }
    
    // Verificação final
    console.log('\n📊 Verificando tabelas criadas...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tabelas no banco:', tables.map(row => Object.values(row)[0]));
    
    console.log('\n🎉 Todas as migrações foram executadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

runSpecificMigrations();

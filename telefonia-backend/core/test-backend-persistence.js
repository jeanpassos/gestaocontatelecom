const axios = require('axios');

async function testBackendPersistence() {
  const baseURL = 'http://localhost:3001';
  
  try {
    console.log('🧪 Testando persistência dos campos via Backend API...\n');
    
    // 1. Primeiro fazer login para obter token
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@teste.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login realizado com sucesso');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 2. Buscar segmentos disponíveis
    console.log('\n2️⃣ Buscando segmentos...');
    const segmentsResponse = await axios.get(`${baseURL}/segments`, { headers });
    const segments = segmentsResponse.data;
    
    if (segments.length > 0) {
      console.log(`✅ ${segments.length} segmentos encontrados`);
      console.log(`Usando segmento: ${segments[0].name} (ID: ${segments[0].id})`);
    }
    
    // 3. Criar empresa com campos problemáticos
    console.log('\n3️⃣ Criando empresa com campos type, segment, contractDate, renewalDate...');
    
    const newCompany = {
      cnpj: '12345678000199',
      corporateName: 'Teste Campos Ltda',
      type: 'headquarters',
      segmentId: segments.length > 0 ? segments[0].id : null,
      contractDate: '2024-01-15',
      renewalDate: '2025-01-15',
      phoneLines: ['11999887766', '1133445566'],
      assets: {
        internet: {
          provider: 'Vivo Fibra',
          speed: '100Mbps'
        }
      },
      address: {
        street: 'Rua Teste',
        number: '123',
        city: 'São Paulo',
        state: 'SP'
      },
      manager: {
        name: 'João Teste',
        email: 'joao@teste.com',
        phone: '11987654321'
      }
    };
    
    const createResponse = await axios.post(`${baseURL}/companies`, newCompany, { headers });
    const createdCompany = createResponse.data;
    
    console.log('✅ Empresa criada com sucesso!');
    console.log(`ID: ${createdCompany.id}`);
    console.log(`Nome: ${createdCompany.corporateName}`);
    console.log(`Tipo: ${createdCompany.type || 'NULL'}`);
    console.log(`Segment: ${createdCompany.segment?.name || 'NULL'}`);
    console.log(`Contract Date: ${createdCompany.contractDate || 'NULL'}`);
    console.log(`Renewal Date: ${createdCompany.renewalDate || 'NULL'}`);
    
    // 4. Atualizar empresa com novos valores
    console.log('\n4️⃣ Atualizando empresa...');
    
    const updateData = {
      contractDate: '2024-06-01',
      renewalDate: '2025-06-01',
      type: 'branch'
    };
    
    const updateResponse = await axios.put(`${baseURL}/companies/${createdCompany.id}`, updateData, { headers });
    const updatedCompany = updateResponse.data;
    
    console.log('✅ Empresa atualizada!');
    console.log(`Tipo: ${updatedCompany.type || 'NULL'}`);
    console.log(`Contract Date: ${updatedCompany.contractDate || 'NULL'}`);
    console.log(`Renewal Date: ${updatedCompany.renewalDate || 'NULL'}`);
    
    // 5. Limpar - deletar empresa teste
    console.log('\n5️⃣ Limpando empresa teste...');
    await axios.delete(`${baseURL}/companies/${createdCompany.id}`, { headers });
    console.log('✅ Empresa teste removida');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('💡 Erro de autenticação - backend pode estar inativo ou credenciais incorretas');
    }
  }
}

testBackendPersistence();

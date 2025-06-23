const axios = require('axios');

async function testAPINetworkFields() {
    console.log('🔍 Teste: API Backend - Criação de empresa com campos de rede...\n');

    const baseURL = 'http://localhost:3001'; // Backend na porta 3001

    // Dados de teste com campos de rede
    const companyData = {
        cnpj: '12345678000199', // CNPJ fictício para teste
        corporateName: 'Empresa Teste Rede Ltda',
        phoneLines: ['(11) 3333-4444', '(11) 5555-6666'],
        type: 'matriz',
        assets: {
            internet: {
                plan: 'Link Dedicado',
                speed: '1GB',
                provider: 'Vivo',
                hasFixedIp: true,
                ipAddress: '10.0.0.100',
                subnetMask: '255.255.255.0',
                gateway: '10.0.0.1',
                dns: '1.1.1.1, 8.8.8.8',
                ipNotes: 'Configuração de rede para teste da API'
            },
            tv: {
                plan: 'TV Premium',
                channels: '150 canais'
            },
            mobileDevices: []
        },
        address: {
            street: 'Rua Teste, 123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567'
        },
        manager: {
            name: 'João Teste',
            phone: '(11) 9999-8888',
            email: 'joao@teste.com'
        }
    };

    try {
        // Primeiro, verificar se o backend está rodando
        console.log('📡 Verificando se backend está ativo...');
        
        try {
            await axios.get(`${baseURL}/health`);
            console.log('✅ Backend está ativo!\n');
        } catch (healthError) {
            console.log('⚠️  Backend pode não estar rodando na porta 3001');
            console.log('Tentando mesmo assim...\n');
        }

        // Tentar criar empresa via API
        console.log('📤 Enviando dados para API POST /companies...');
        console.log('Dados enviados:', JSON.stringify(companyData, null, 2));

        const response = await axios.post(`${baseURL}/companies`, companyData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('\n✅ SUCESSO - Empresa criada via API!');
        console.log('📋 Resposta da API:');
        console.log(JSON.stringify(response.data, null, 2));

        // Verificar especificamente os campos de rede na resposta
        const assets = response.data.assets;
        if (assets && assets.internet) {
            console.log('\n🌐 Campos de Rede na Resposta:');
            console.log(`IP Address: ${assets.internet.ipAddress || 'NÃO ENCONTRADO'}`);
            console.log(`Subnet Mask: ${assets.internet.subnetMask || 'NÃO ENCONTRADO'}`);
            console.log(`Gateway: ${assets.internet.gateway || 'NÃO ENCONTRADO'}`);
            console.log(`DNS: ${assets.internet.dns || 'NÃO ENCONTRADO'}`);
            console.log(`IP Notes: ${assets.internet.ipNotes || 'NÃO ENCONTRADO'}`);

            if (assets.internet.ipAddress && assets.internet.gateway) {
                console.log('\n🎉 SUCESSO COMPLETO: API persiste campos de rede corretamente!');
            } else {
                console.log('\n❌ PROBLEMA: API não retornou campos de rede');
            }
        } else {
            console.log('\n❌ PROBLEMA: Assets não encontrados na resposta da API');
        }

        // Tentar buscar a empresa criada para confirmar persistência
        console.log('\n🔍 Confirmando persistência - Buscando empresa...');
        const getResponse = await axios.get(`${baseURL}/companies/${response.data.id}`);
        
        const savedAssets = getResponse.data.assets;
        console.log('\n📋 Assets salvos no banco:');
        console.log(JSON.stringify(savedAssets, null, 2));

    } catch (error) {
        console.error('\n❌ ERRO na API:', error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados do erro:', error.response.data);
        } else if (error.code === 'ECONNREFUSED') {
            console.error('❌ Backend não está rodando na porta 3001');
            console.error('📝 Certifique-se de que o backend está ativo: npm run start:dev');
        }
    }
}

testAPINetworkFields();

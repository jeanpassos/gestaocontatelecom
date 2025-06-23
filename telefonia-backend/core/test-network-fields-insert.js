const mysql = require('mysql2/promise');

async function testNetworkFieldsInsert() {
  const connection = await mysql.createConnection({
    host: '201.91.93.55',
    user: 'telefonia',
    password: 'ZHADyZKreJLjh6RM',
    database: 'telefonia'
  });

  try {
    console.log('🔍 Teste: Inserindo empresa com campos de rede...\n');

    // Buscar uma empresa existente para atualizar
    const [companies] = await connection.execute(
      'SELECT id, corporate_name, assets FROM company LIMIT 1'
    );

    if (companies.length === 0) {
      console.log('❌ Nenhuma empresa encontrada para teste');
      return;
    }

    const company = companies[0];
    console.log(`📋 Empresa selecionada: ${company.corporate_name}`);
    console.log(`🔍 Assets atuais:`, JSON.stringify(company.assets, null, 2));

    // Criar objeto assets com campos de rede
    const newAssets = {
      tv: {
        plan: "TV Premium",
        channels: "200 canais"
      },
      internet: {
        plan: "Link Dedicado", 
        speed: "600MB",
        provider: "Vivo",
        hasFixedIp: true,
        ipAddress: "192.168.1.100",
        subnetMask: "255.255.255.0", 
        gateway: "192.168.1.1",
        dns: "8.8.8.8, 8.8.4.4",
        ipNotes: "IP fixo configurado para servidor interno"
      },
      mobileDevices: [
        {
          model: "iPhone 13",
          assignedTo: "João Silva",
          assignedDate: "2024-01-15",
          phoneLine: "(11) 99999-8888"
        }
      ]
    };

    // Atualizar empresa com novos assets
    await connection.execute(
      'UPDATE company SET assets = ? WHERE id = ?',
      [JSON.stringify(newAssets), company.id]
    );

    console.log('\n✅ Assets atualizados com campos de rede!');

    // Verificar se foi salvo corretamente
    const [updatedCompanies] = await connection.execute(
      'SELECT id, corporate_name, assets FROM company WHERE id = ?',
      [company.id]
    );

    const updatedCompany = updatedCompanies[0];
    console.log('\n📋 Verificação - Assets salvos:');
    console.log(JSON.stringify(updatedCompany.assets, null, 2));

    // Verificar especificamente os campos de rede
    const assets = updatedCompany.assets;
    console.log('\n🌐 Campos de Rede Específicos:');
    console.log(`IP Address: ${assets.internet?.ipAddress || 'NÃO ENCONTRADO'}`);
    console.log(`Subnet Mask: ${assets.internet?.subnetMask || 'NÃO ENCONTRADO'}`);
    console.log(`Gateway: ${assets.internet?.gateway || 'NÃO ENCONTRADO'}`);
    console.log(`DNS: ${assets.internet?.dns || 'NÃO ENCONTRADO'}`);
    console.log(`IP Notes: ${assets.internet?.ipNotes || 'NÃO ENCONTRADO'}`);

    if (assets.internet?.ipAddress && assets.internet?.gateway) {
      console.log('\n🎉 SUCESSO: Campos de rede foram persistidos corretamente!');
    } else {
      console.log('\n❌ ERRO: Campos de rede não foram persistidos');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

testNetworkFieldsInsert();

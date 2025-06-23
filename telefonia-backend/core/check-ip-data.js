const mysql = require('mysql2/promise');

async function checkIPData() {
  const connection = await mysql.createConnection({
    host: '201.91.93.55',
    user: 'telefonia', 
    password: 'ZHADyZKreJLjh6RM',
    database: 'telefonia'
  });

  try {
    console.log('🔍 Verificando dados de IP/rede salvos no banco...\n');
    
    // Buscar todas as empresas e seus assets
    const [companies] = await connection.execute(`
      SELECT 
        id,
        corporate_name,
        assets
      FROM company 
      WHERE assets IS NOT NULL
    `);

    console.log(`📊 Encontradas ${companies.length} empresas com assets:\n`);

    companies.forEach((company, index) => {
      console.log(`${index + 1}. 🏢 ${company.corporate_name}`);
      console.log(`   ID: ${company.id}`);
      
      if (company.assets) {
        const assets = company.assets;
        
        // Verificar dados de internet
        if (assets.internet) {
          console.log('   🌐 Internet:');
          console.log(`      Plan: ${assets.internet.plan || 'N/A'}`);
          console.log(`      Speed: ${assets.internet.speed || 'N/A'}`);
          console.log(`      Provider: ${assets.internet.provider || 'N/A'}`);
          console.log(`      Has Fixed IP: ${assets.internet.hasFixedIp || false}`);
          
          // CAMPOS DE REDE ESPECÍFICOS
          console.log('   🌐 CAMPOS DE REDE:');
          console.log(`      ⚪ IP Address: ${assets.internet.ipAddress || 'NÃO SALVO'}`);
          console.log(`      ⚪ Subnet Mask: ${assets.internet.subnetMask || 'NÃO SALVO'}`);
          console.log(`      ⚪ Gateway: ${assets.internet.gateway || 'NÃO SALVO'}`);
          console.log(`      ⚪ DNS: ${assets.internet.dns || 'NÃO SALVO'}`);
          console.log(`      ⚪ IP Notes: ${assets.internet.ipNotes || 'NÃO SALVO'}`);
        } else {
          console.log('   ❌ Sem dados de internet');
        }
        
        // Verificar outros assets
        if (assets.tv) {
          console.log(`   📺 TV: ${assets.tv.plan || 'N/A'}`);
        }
        if (assets.mobileDevices && assets.mobileDevices.length > 0) {
          console.log(`   📱 Mobile Devices: ${assets.mobileDevices.length} dispositivos`);
        }
      } else {
        console.log('   ❌ Assets é NULL');
      }
      
      console.log(''); // Linha em branco
    });

    // Estatísticas
    let companiesWithNetworkData = 0;
    companies.forEach(company => {
      if (company.assets && company.assets.internet && 
          (company.assets.internet.ipAddress || company.assets.internet.gateway)) {
        companiesWithNetworkData++;
      }
    });

    console.log('📈 ESTATÍSTICAS:');
    console.log(`Total de empresas: ${companies.length}`);
    console.log(`Empresas com dados de rede: ${companiesWithNetworkData}`);
    
    if (companiesWithNetworkData === 0) {
      console.log('\n❌ PROBLEMA: Nenhuma empresa tem dados de rede salvos!');
      console.log('💡 Campos de IP/rede não estão sendo persistidos via frontend.');
    } else {
      console.log('\n✅ Algumas empresas têm dados de rede salvos.');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

checkIPData();

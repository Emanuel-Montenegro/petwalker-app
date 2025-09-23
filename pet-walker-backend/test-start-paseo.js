const fetch = require('node-fetch');

async function testStartPaseo() {
  try {
    console.log('=== PROBANDO INICIO DE PASEO ===\n');
    
    // Primero hacer login
    console.log('🔐 Haciendo login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'paseador@test.com',
        contrasena: '123456'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login falló: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso:', loginData.usuario.email);
    const token = loginData.token;
    
    // Obtener paseos del paseador
    console.log('📋 Obteniendo paseos...');
    const paseosResponse = await fetch('http://localhost:3001/api/paseos/mios/paseador', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!paseosResponse.ok) {
      throw new Error(`Error obteniendo paseos: ${paseosResponse.status}`);
    }
    
    const responseData = await response.json();
    console.log('✅ Respuesta completa:', JSON.stringify(responseData, null, 2));
    
    // La respuesta puede ser un objeto con propiedad paseos o directamente un array
    const paseos = Array.isArray(responseData) ? responseData : responseData.paseos || [];
    console.log('✅ Paseos obtenidos:', paseos.length);
    
    // Mostrar detalles de todos los paseos
    console.log('📋 Detalles de paseos:');
    paseos.forEach((paseo, index) => {
      console.log(`  ${index + 1}. ID: ${paseo.id}, Estado: ${paseo.estado}, Mascota: ${paseo.mascota?.nombre || 'N/A'}`);
    });
    
    // Buscar un paseo pendiente o crear uno nuevo
    let paseoParaIniciar = paseos.find(p => p.estado === 'ACEPTADO');
    
    if (!paseoParaIniciar) {
      console.log('🆕 No hay paseos aceptados, buscando pendientes...');
      paseoParaIniciar = paseos.find(p => p.estado === 'PENDIENTE');
      
      if (paseoParaIniciar) {
        console.log(`✅ Encontrado paseo pendiente ID: ${paseoParaIniciar.id}`);
        
        // Aceptar el paseo primero
        console.log('🤝 Aceptando paseo...');
        const aceptarResponse = await fetch(`http://localhost:3001/api/paseos/${paseoParaIniciar.id}/aceptar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!aceptarResponse.ok) {
          console.log('❌ Error al aceptar paseo:', aceptarResponse.status);
          return;
        }
        
        console.log('✅ Paseo aceptado exitosamente');
      }
    }
    
    if (!paseoParaIniciar) {
      console.log('❌ No hay paseos disponibles para iniciar');
      return;
    }
    
    // Iniciar el paseo
    console.log('\n🚀 Iniciando paseo...');
    const iniciarResponse = await fetch(`http://localhost:3001/api/paseos/${paseoParaIniciar.id}/iniciar`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!iniciarResponse.ok) {
      throw new Error(`Error iniciando paseo: ${iniciarResponse.status}`);
    }
    
    const iniciarData = await iniciarResponse.json();
    console.log('✅ Paseo iniciado exitosamente');
    const paseoIniciado = iniciarData.paseo;
    
    // Registrar un punto GPS de prueba
    console.log('\n📍 Registrando punto GPS de prueba...');
    const gpsResponse = await fetch('http://localhost:3001/api/gps/registrar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paseoId: paseoIniciado.id,
        latitud: -34.6037,
        longitud: -58.3816,
        precision: 10,
        velocidad: 5.5,
        altitud: 25,
        bateria: 85
      })
    });
    
    if (!gpsResponse.ok) {
      throw new Error(`Error registrando GPS: ${gpsResponse.status}`);
    }
    
    const gpsData = await gpsResponse.json();
    console.log('✅ Punto GPS registrado exitosamente');
    console.log('📊 Datos del punto:', gpsData.punto);
    
    console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('- Login: ✅');
    console.log('- Obtener paseos: ✅');
    console.log('- Iniciar paseo: ✅');
    console.log('- Registrar GPS: ✅');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testStartPaseo();
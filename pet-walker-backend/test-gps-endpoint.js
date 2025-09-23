const axios = require('axios');

async function testGPSEndpoint() {
  try {
    console.log('=== PROBANDO ENDPOINT GPS ===\n');
    
    // Primero hacer login para obtener el token
    console.log('🔐 Haciendo login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'paseador@test.com',
      contrasena: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso, token obtenido');
    
    // Probar obtener puntos GPS para cada paseo
    const paseoIds = [3, 4, 5, 6];
    
    for (const paseoId of paseoIds) {
      console.log(`\n📍 Probando paseo ID: ${paseoId}`);
      
      try {
        const response = await axios.get(`http://localhost:3001/api/gps/${paseoId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log(`✅ Respuesta exitosa:`);
        console.log(`   Paseo ID: ${response.data.paseoId}`);
        console.log(`   Distancia total: ${response.data.distanciaTotal}m`);
        console.log(`   Velocidad promedio: ${response.data.velocidadPromedio} km/h`);
        console.log(`   Cantidad de puntos: ${response.data.cantidadPuntos}`);
        console.log(`   Coordenadas: ${response.data.coordenadas.length} puntos`);
        
        if (response.data.coordenadas.length > 0) {
          console.log(`   Primeras 3 coordenadas: ${JSON.stringify(response.data.coordenadas.slice(0, 3))}`);
        } else {
          console.log(`   ❌ Sin coordenadas`);
        }
        
      } catch (error) {
        if (error.response) {
          console.log(`❌ Error ${error.response.status}: ${error.response.data.mensaje}`);
        } else {
          console.log(`❌ Error de conexión: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
  }
}

testGPSEndpoint();
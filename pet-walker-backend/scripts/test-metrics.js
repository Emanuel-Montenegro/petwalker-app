const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

// Simulación de datos de prueba
async function testMetricsEndpoints() {
  console.log('🧪 Probando endpoints de métricas...\n');

  // Nota: Necesitarás un token de admin válido para estas pruebas
  const adminToken = 'tu-token-de-admin-aqui';
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`,
    'Cookie': `token=${adminToken}`
  };

  const endpoints = [
    { name: '📊 Métricas de Negocio', url: `${API_BASE}/metrics/business` },
    { name: '🔧 Métricas del Sistema', url: `${API_BASE}/metrics/system` },
    { name: '📈 Actividad Reciente', url: `${API_BASE}/metrics/activity` }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Probando: ${endpoint.name}`);
      console.log(`URL: ${endpoint.url}`);
      
      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Éxito:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
      } else {
        console.log(`❌ Error: ${response.status} - ${response.statusText}`);
        const errorText = await response.text();
        console.log('Detalles:', errorText.substring(0, 100) + '...');
      }
    } catch (error) {
      console.log(`❌ Error de conexión: ${error.message}`);
    }
    
    console.log('---\n');
  }
}

// Función para crear datos de prueba
async function createTestData() {
  console.log('🔧 Creando datos de prueba...\n');
  
  // Aquí puedes agregar código para crear datos de prueba
  // Por ejemplo, crear usuarios, mascotas, paseos, etc.
  
  console.log('💡 Para probar las métricas completas, necesitas:');
  console.log('1. Usuarios registrados (DUENO, PASEADOR, ADMIN)');
  console.log('2. Mascotas registradas');
  console.log('3. Paseos creados con diferentes estados');
  console.log('4. Calificaciones de paseos');
  console.log('5. Notificaciones en el sistema');
  console.log('\n');
}

// Ejecutar pruebas
async function main() {
  console.log('🚀 PRUEBAS DE MÉTRICAS PARA PET WALKER\n');
  
  await createTestData();
  await testMetricsEndpoints();
  
  console.log('🎉 Pruebas completadas!');
  console.log('\n📝 Notas:');
  console.log('1. Actualiza el token de admin en el script');
  console.log('2. Asegúrate de que el servidor esté corriendo en puerto 3001');
  console.log('3. Verifica que tengas datos en la base de datos para ver métricas reales');
}

main().catch(console.error); 
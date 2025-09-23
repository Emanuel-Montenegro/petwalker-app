const axios = require('axios');

// Test de validación para el endpoint de creación de paseos
async function testValidation() {
  console.log('🧪 Iniciando test de validación...');
  
  const testData = {
    mascotaId: 1,
    fecha: '2025-09-24', // Formato de fecha simple (yyyy-MM-dd)
    hora: '09:00',
    horaInicio: '09:00',
    duracion: 60,
    usuarioId: 1,
    tipoServicio: 'GRUPAL',
    precio: 35,
    origenLatitud: 0,
    origenLongitud: 0
  };
  
  try {
    console.log('📤 Enviando datos:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('http://localhost:3001/api/paseos', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Respuesta exitosa:', response.status);
    console.log('📥 Datos recibidos:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Error de respuesta:', error.response.status);
      console.log('📄 Mensaje de error:', error.response.data);
    } else {
      console.log('❌ Error de conexión:', error.message);
    }
  }
}

// Test con datos inválidos
async function testInvalidData() {
  console.log('\n🧪 Test con datos inválidos...');
  
  const invalidData = {
    // Falta mascotaId (requerido)
    fecha: '2025-09-24',
    hora: '09:00',
    duracion: 60
  };
  
  try {
    console.log('📤 Enviando datos inválidos:', JSON.stringify(invalidData, null, 2));
    
    const response = await axios.post('http://localhost:3001/api/paseos', invalidData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Respuesta inesperada:', response.status);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Error esperado:', error.response.status);
      console.log('📄 Mensaje de validación:', error.response.data);
    } else {
      console.log('❌ Error de conexión:', error.message);
    }
  }
}

// Ejecutar tests
async function runTests() {
  await testValidation();
  await testInvalidData();
  console.log('\n🏁 Tests completados');
}

runTests().catch(console.error);
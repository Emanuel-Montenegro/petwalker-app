const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('=== PROBANDO LOGIN SIMPLE ===\n');
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'paseador@test.com',
        contrasena: '123456'
      })
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.text();
    console.log('Response:', data);
    
    if (response.ok) {
      const jsonData = JSON.parse(data);
      console.log('✅ Login exitoso!');
      console.log('Token:', jsonData.token?.substring(0, 20) + '...');
      console.log('Usuario:', jsonData.usuario);
    } else {
      console.log('❌ Login falló');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function debugLogin() {
  try {
    console.log('=== DEBUG LOGIN ===\n');
    
    // 1. Verificar conexión a la base de datos
    console.log('1. Verificando conexión a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa\n');
    
    // 2. Buscar usuario
    console.log('2. Buscando usuario paseador@test.com...');
    const usuario = await prisma.usuario.findUnique({
      where: { email: 'paseador@test.com' }
    });
    
    if (!usuario) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('✅ Usuario encontrado:');
    console.log('- ID:', usuario.id);
    console.log('- Nombre:', usuario.nombre);
    console.log('- Email:', usuario.email);
    console.log('- Rol:', usuario.rol);
    console.log('- Hash contraseña:', usuario.contrasena?.substring(0, 20) + '...');
    console.log();
    
    // 3. Verificar contraseña
    console.log('3. Verificando contraseña...');
    const contraseñaValida = await bcrypt.compare('123456', usuario.contrasena);
    console.log('Contraseña válida:', contraseñaValida);
    
    if (contraseñaValida) {
      console.log('✅ Login debería funcionar');
    } else {
      console.log('❌ Contraseña incorrecta');
    }
    
  } catch (error) {
    console.error('❌ Error en debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin();
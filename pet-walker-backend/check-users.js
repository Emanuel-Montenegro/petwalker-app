const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('=== VERIFICANDO USUARIOS ===\n');
    
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        contrasena: true
      }
    });
    
    console.log(`📊 Total de usuarios: ${usuarios.length}\n`);
    
    for (const usuario of usuarios) {
      console.log(`👤 Usuario ID: ${usuario.id}`);
      console.log(`   Email: ${usuario.email}`);
      console.log(`   Nombre: ${usuario.nombre}`);
      console.log(`   Rol: ${usuario.rol}`);
      console.log(`   Hash contraseña: ${usuario.contrasena.substring(0, 20)}...`);
      
      // Probar si la contraseña '123456' coincide
      const esValida = await bcrypt.compare('123456', usuario.contrasena);
      console.log(`   ✅ Contraseña '123456' válida: ${esValida}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
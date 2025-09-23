const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function fixPasswords() {
  try {
    console.log('=== ARREGLANDO CONTRASEÑAS ===\n');
    
    // Generar hash correcto para '123456'
    const hashCorrecto = await bcrypt.hash('123456', 10);
    console.log('Hash generado para 123456:', hashCorrecto.substring(0, 20) + '...');
    
    // Actualizar usuarios
    const usuarios = await prisma.usuario.findMany();
    
    for (const usuario of usuarios) {
      console.log(`\nActualizando usuario: ${usuario.email}`);
      
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { contrasena: hashCorrecto }
      });
      
      console.log('✅ Contraseña actualizada');
    }
    
    console.log('\n=== VERIFICANDO CONTRASEÑAS ===\n');
    
    // Verificar que funcionen
    const usuariosActualizados = await prisma.usuario.findMany();
    
    for (const usuario of usuariosActualizados) {
      const esValida = await bcrypt.compare('123456', usuario.contrasena);
      console.log(`${usuario.email}: ${esValida ? '✅' : '❌'} Contraseña válida`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPasswords();
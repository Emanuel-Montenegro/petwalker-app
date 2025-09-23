const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestPaseo() {
  try {
    console.log('=== CREANDO PASEO DE PRUEBA ===\n');
    
    // Verificar que existe el paseador
    const paseador = await prisma.usuario.findFirst({
      where: { email: 'paseador@test.com' }
    });
    
    if (!paseador) {
      console.log('❌ No se encontró el paseador');
      return;
    }
    
    console.log('✅ Paseador encontrado:', paseador.nombre);
    
    // Buscar una mascota existente
    const mascota = await prisma.mascota.findFirst();
    
    if (!mascota) {
      console.log('❌ No se encontró ninguna mascota');
      return;
    }
    
    console.log('✅ Mascota encontrada:', mascota.nombre);
    
    // Crear un paseo pendiente
    const nuevoPaseo = await prisma.paseo.create({
      data: {
        mascotaId: mascota.id,
        fecha: new Date(),
        horaInicio: '14:00',
        duracion: 30,
        estado: 'PENDIENTE',
        tipoServicio: 'NORMAL',
        precio: 500.0,
        origenLatitud: -34.6037,
        origenLongitud: -58.3816
      }
    });
    
    console.log('✅ Paseo creado exitosamente:', {
      id: nuevoPaseo.id,
      estado: nuevoPaseo.estado,
      mascota: mascota.nombre,
      fecha: nuevoPaseo.fecha,
      hora: nuevoPaseo.horaInicio
    });
    
    console.log(`\n🎯 URL para probar: http://localhost:3000/dashboard/paseos/${nuevoPaseo.id}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestPaseo();
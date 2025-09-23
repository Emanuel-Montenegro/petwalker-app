const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugGPS() {
  try {
    console.log('=== VERIFICANDO DATOS GPS ===\n');
    
    // Obtener todos los paseos
    const paseos = await prisma.paseo.findMany({
      select: {
        id: true,
        estado: true,
        fecha: true,
        horaInicio: true,
        creadoEn: true,
        mascota: {
          select: {
            nombre: true
          }
        },
        _count: {
          select: {
            puntosGPS: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      },
      take: 10
    });
    
    console.log(`Encontrados ${paseos.length} paseos:\n`);
    
    for (const paseo of paseos) {
      console.log(`Paseo ID: ${paseo.id}`);
      console.log(`Estado: ${paseo.estado}`);
      console.log(`Mascota: ${paseo.mascota.nombre}`);
      console.log(`Fecha: ${paseo.fecha}`);
      console.log(`Hora inicio: ${paseo.horaInicio}`);
      console.log(`Creado en: ${paseo.creadoEn}`);
      console.log(`Puntos GPS: ${paseo._count.puntosGPS}`);
      
      if (paseo._count.puntosGPS > 0) {
        // Obtener algunos puntos GPS de ejemplo
        const puntos = await prisma.puntoGPS.findMany({
          where: { paseoId: paseo.id },
          select: {
            latitud: true,
            longitud: true,
            timestamp: true
          },
          orderBy: { timestamp: 'asc' },
          take: 3
        });
        
        console.log('Primeros 3 puntos GPS:');
        puntos.forEach((punto, index) => {
          console.log(`  ${index + 1}. Lat: ${punto.latitud}, Lng: ${punto.longitud}, Time: ${punto.timestamp}`);
        });
      }
      
      console.log('---\n');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugGPS();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testGPSAPI() {
  try {
    console.log('=== PROBANDO API GPS ===\n');
    
    // Obtener todos los paseos con sus puntos GPS
    const paseos = await prisma.paseo.findMany({
      select: {
        id: true,
        estado: true,
        fecha: true,
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
      }
    });

    console.log(`📊 Total de paseos: ${paseos.length}`);
    
    for (const paseo of paseos) {
      console.log(`\n🚶 Paseo ID: ${paseo.id}`);
      console.log(`   Mascota: ${paseo.mascota?.nombre}`);
      console.log(`   Estado: ${paseo.estado}`);
      console.log(`   Fecha: ${paseo.fecha}`);
      console.log(`   Puntos GPS: ${paseo._count.puntosGPS}`);
      
      if (paseo._count.puntosGPS > 0) {
        // Obtener los puntos GPS para este paseo
        const puntos = await prisma.puntoGPS.findMany({
          where: { paseoId: paseo.id },
          orderBy: { timestamp: 'asc' },
          take: 5 // Solo los primeros 5 puntos
        });
        
        console.log(`   Primeros ${Math.min(5, puntos.length)} puntos:`);
        puntos.forEach((punto, index) => {
          console.log(`     ${index + 1}. Lat: ${punto.latitud}, Lng: ${punto.longitud}, Tiempo: ${punto.timestamp}`);
        });
        
        // Simular la respuesta de la API
        const coordenadas = puntos.map(p => [p.longitud, p.latitud]);
        console.log(`   Coordenadas para mapa: ${JSON.stringify(coordenadas.slice(0, 3))}...`);
      } else {
        console.log(`   ❌ Sin puntos GPS`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGPSAPI();
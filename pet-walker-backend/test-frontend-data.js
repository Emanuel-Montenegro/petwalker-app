const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFrontendData() {
  try {
    console.log('=== VERIFICANDO DATOS PARA FRONTEND ===\n');
    
    // Obtener paseos con sus datos GPS
    const paseos = await prisma.paseo.findMany({
      where: {
        estado: { in: ['EN_CURSO', 'FINALIZADO'] }
      },
      select: {
        id: true,
        estado: true,
        fecha: true,
        origenLatitud: true,
        origenLongitud: true,
        paseadorId: true,
        _count: {
          select: {
            puntosGPS: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });
    
    console.log(`📊 Total de paseos encontrados: ${paseos.length}`);
    
    for (const paseo of paseos) {
      console.log(`\n🚶 Paseo ID: ${paseo.id}`);
      console.log(`   Estado: ${paseo.estado}`);
      console.log(`   Fecha: ${paseo.fecha}`);
      console.log(`   Origen: ${paseo.origenLatitud}, ${paseo.origenLongitud}`);
      console.log(`   Paseador ID: ${paseo.paseadorId}`);
      console.log(`   Puntos GPS: ${paseo._count.puntosGPS}`);
      
      // Obtener algunos puntos GPS de muestra
      if (paseo._count.puntosGPS > 0) {
        const puntosGPS = await prisma.puntoGPS.findMany({
          where: { paseoId: paseo.id },
          select: {
            latitud: true,
            longitud: true,
            timestamp: true
          },
          orderBy: { timestamp: 'asc' },
          take: 3
        });
        
        console.log('   📍 Primeros 3 puntos GPS:');
        puntosGPS.forEach((punto, index) => {
          console.log(`      ${index + 1}. Lat: ${punto.latitud}, Lng: ${punto.longitud}, Tiempo: ${punto.timestamp}`);
        });
      }
    }
    
    // Verificar si hay paseos en curso
    const paseosEnCurso = paseos.filter(p => p.estado === 'EN_CURSO');
    console.log(`\n🏃 Paseos en curso: ${paseosEnCurso.length}`);
    
    if (paseosEnCurso.length > 0) {
      console.log('\n⚠️  IMPORTANTE: Hay paseos en curso. El frontend debería mostrar el mapa automáticamente.');
      paseosEnCurso.forEach(paseo => {
        console.log(`   - Paseo ${paseo.id}: ${paseo._count.puntosGPS} puntos GPS`);
      });
    }
    
    // Verificar paseos finalizados con datos GPS
    const paseosConGPS = paseos.filter(p => p._count.puntosGPS > 0);
    console.log(`\n📍 Paseos con datos GPS: ${paseosConGPS.length}`);
    
    if (paseosConGPS.length > 0) {
      console.log('\n✅ PASEOS QUE DEBERÍAN MOSTRAR RUTA EN HISTORIAL:');
      paseosConGPS.forEach(paseo => {
        console.log(`   - Paseo ${paseo.id} (${paseo.estado}): ${paseo._count.puntosGPS} puntos`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFrontendData();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkGPSData() {
  try {
    console.log('🔍 Verificando datos GPS en la base de datos...');
    
    // Contar total de paseos
    const totalPaseos = await prisma.paseo.count();
    console.log(`📊 Total de paseos: ${totalPaseos}`);
    
    // Contar paseos por estado
    const paseosPorEstado = await prisma.paseo.groupBy({
      by: ['estado'],
      _count: {
        id: true
      }
    });
    
    console.log('📈 Paseos por estado:');
    paseosPorEstado.forEach(grupo => {
      console.log(`  - ${grupo.estado}: ${grupo._count.id}`);
    });
    
    // Contar total de puntos GPS
    const totalPuntosGPS = await prisma.puntoGPS.count();
    console.log(`🗺️  Total de puntos GPS: ${totalPuntosGPS}`);
    
    // Verificar paseos con puntos GPS
    const paseosConGPS = await prisma.paseo.findMany({
      include: {
        _count: {
          select: {
            puntosGPS: true
          }
        },
        mascota: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });
    
    console.log('\n🐕 Detalle de paseos y sus puntos GPS:');
    paseosConGPS.forEach(paseo => {
      console.log(`
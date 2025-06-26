import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCalificaciones() {
  try {
    console.log('🌱 Iniciando seed de calificaciones...');

    // Verificar que existan usuarios
    const usuarios = await prisma.usuario.findMany();
    console.log(`📊 Usuarios encontrados: ${usuarios.length}`);

    if (usuarios.length < 2) {
      console.log('❌ Se necesitan al menos 2 usuarios para crear datos de prueba');
      return;
    }

    // Buscar un dueño y un paseador
    const dueno = usuarios.find(u => u.rol === 'DUENO');
    const paseador = usuarios.find(u => u.rol === 'PASEADOR');

    if (!dueno || !paseador) {
      console.log('❌ Se necesita al menos un DUENO y un PASEADOR');
      return;
    }

    console.log(`👤 Dueño: ${dueno.nombre} (ID: ${dueno.id})`);
    console.log(`🚶 Paseador: ${paseador.nombre} (ID: ${paseador.id})`);

    // Verificar si existe una mascota
    let mascota = await prisma.mascota.findFirst({
      where: { usuarioId: dueno.id }
    });

    if (!mascota) {
      // Crear una mascota de prueba
      mascota = await prisma.mascota.create({
        data: {
          nombre: 'Rex',
          especie: 'Perro',
          raza: 'Golden Retriever',
          edad: 3,
          sociable: true,
          usuarioId: dueno.id,
          alergias: [],
          discapacidades: [],
          necesitaBozal: false,
          estadoVacunacion: 'AL_DIA',
          observaciones: 'Perro muy amigable y obediente'
        }
      });
      console.log(`🐕 Mascota creada: ${mascota.nombre} (ID: ${mascota.id})`);
    } else {
      console.log(`🐕 Mascota encontrada: ${mascota.nombre} (ID: ${mascota.id})`);
    }

    // Crear paseos finalizados para poder calificar
    const paseosFinalizados = [];
    
    for (let i = 0; i < 3; i++) {
      const fechaPaseo = new Date();
      fechaPaseo.setDate(fechaPaseo.getDate() - (i + 1)); // Paseos de días anteriores

      const paseo = await prisma.paseo.create({
        data: {
          fecha: fechaPaseo,
          horaInicio: '10:00',
          duracion: 45,
          estado: 'FINALIZADO',
          tipoServicio: 'NORMAL',
          precio: 25.0,
          mascotaId: mascota.id,
          paseadorId: paseador.id,
          creadoEn: new Date(fechaPaseo.getTime() - 60000) // Creado 1 minuto antes
        }
      });

      paseosFinalizados.push(paseo);
      console.log(`✅ Paseo finalizado creado: ID ${paseo.id} - ${fechaPaseo.toLocaleDateString()}`);
    }

    // Crear algunas calificaciones de ejemplo
    const calificaciones = [
      {
        paseoId: paseosFinalizados[0].id,
        paseadorId: paseador.id,
        puntuacion: 5,
        comentario: '¡Excelente servicio! Rex volvió muy feliz y cansado. El paseador fue muy profesional.'
      },
      {
        paseoId: paseosFinalizados[1].id,
        paseadorId: paseador.id,
        puntuacion: 4,
        comentario: 'Muy buen paseo, aunque me hubiera gustado más comunicación durante el recorrido.'
      }
      // Dejamos el tercer paseo sin calificar para poder probarlo
    ];

    for (const calData of calificaciones) {
      const calificacion = await prisma.calificacion.create({
        data: calData
      });
      console.log(`⭐ Calificación creada: ${calificacion.puntuacion} estrellas para paseo ${calificacion.paseoId}`);
    }

    // Mostrar estadísticas
    const totalCalificaciones = await prisma.calificacion.count({
      where: { paseadorId: paseador.id }
    });

    const promedio = await prisma.calificacion.aggregate({
      where: { paseadorId: paseador.id },
      _avg: { puntuacion: true }
    });

    console.log('\n📊 ESTADÍSTICAS:');
    console.log(`Total de calificaciones: ${totalCalificaciones}`);
    console.log(`Promedio del paseador: ${promedio._avg.puntuacion?.toFixed(2)} estrellas`);
    console.log(`Paseos sin calificar: 1 (ID: ${paseosFinalizados[2].id})`);

    console.log('\n✅ Seed de calificaciones completado exitosamente!');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el seed si se llama directamente
if (require.main === module) {
  seedCalificaciones();
}

export default seedCalificaciones; 
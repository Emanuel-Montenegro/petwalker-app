const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log('=== CREANDO DATOS DE PRUEBA ===\n');
    
    // Crear usuario dueño
    const hashedPasswordDueno = await bcrypt.hash('123456', 10);
    const dueno = await prisma.usuario.upsert({
      where: { email: 'dueno@test.com' },
      update: {},
      create: {
        nombre: 'Juan Pérez',
        email: 'dueno@test.com',
        contrasena: hashedPasswordDueno,
        rol: 'DUENO'
      }
    });
    
    // Crear usuario paseador
    const hashedPasswordPaseador = await bcrypt.hash('123456', 10);
    const paseador = await prisma.usuario.upsert({
      where: { email: 'paseador@test.com' },
      update: {},
      create: {
        nombre: 'María García',
        email: 'paseador@test.com',
        contrasena: hashedPasswordPaseador,
        rol: 'PASEADOR'
      }
    });
    
    // Crear mascota
    const mascota = await prisma.mascota.upsert({
      where: { id: 1 },
      update: {},
      create: {
        nombre: 'Max',
        especie: 'Perro',
        raza: 'Golden Retriever',
        edad: 3,
        sociable: true,
        usuarioId: dueno.id,
        alergias: [],
        discapacidades: [],
        estadoVacunacion: 'COMPLETO',
        necesitaBozal: false,
        observaciones: 'Perro muy amigable'
      }
    });
    
    // Crear paseos de prueba
    const paseo1 = await prisma.paseo.create({
      data: {
        fecha: new Date('2024-01-15'),
        horaInicio: '10:00',
        duracion: 60,
        estado: 'FINALIZADO',
        tipoServicio: 'NORMAL',
        precio: 25.0,
        mascotaId: mascota.id,
        paseadorId: paseador.id,
        origenLatitud: -34.6037,
        origenLongitud: -58.3816
      }
    });
    
    const paseo2 = await prisma.paseo.create({
      data: {
        fecha: new Date('2024-01-16'),
        horaInicio: '15:00',
        duracion: 45,
        estado: 'FINALIZADO',
        tipoServicio: 'NORMAL',
        precio: 20.0,
        mascotaId: mascota.id,
        paseadorId: paseador.id,
        origenLatitud: -34.6037,
        origenLongitud: -58.3816
      }
    });
    
    const paseo3 = await prisma.paseo.create({
      data: {
        fecha: new Date('2024-01-17'),
        horaInicio: '09:00',
        duracion: 30,
        estado: 'FINALIZADO',
        tipoServicio: 'NORMAL',
        precio: 15.0,
        mascotaId: mascota.id,
        paseadorId: paseador.id,
        origenLatitud: -34.6037,
        origenLongitud: -58.3816
      }
    });
    
    // Crear puntos GPS para el paseo 1 (ruta completa)
    const puntosGPS1 = [
      { latitud: -34.6037, longitud: -58.3816 }, // Punto de inicio
      { latitud: -34.6040, longitud: -58.3820 },
      { latitud: -34.6045, longitud: -58.3825 },
      { latitud: -34.6050, longitud: -58.3830 },
      { latitud: -34.6055, longitud: -58.3835 },
      { latitud: -34.6060, longitud: -58.3840 },
      { latitud: -34.6065, longitud: -58.3845 },
      { latitud: -34.6070, longitud: -58.3850 },
      { latitud: -34.6075, longitud: -58.3855 },
      { latitud: -34.6080, longitud: -58.3860 }
    ];
    
    for (let i = 0; i < puntosGPS1.length; i++) {
      await prisma.puntoGPS.create({
        data: {
          paseoId: paseo1.id,
          latitud: puntosGPS1[i].latitud,
          longitud: puntosGPS1[i].longitud,
          timestamp: new Date(Date.now() - (puntosGPS1.length - i) * 60000), // 1 minuto entre puntos
          precision: 5.0,
          velocidad: 1.5
        }
      });
    }
    
    // Crear puntos GPS para el paseo 2 (ruta parcial)
    const puntosGPS2 = [
      { latitud: -34.6037, longitud: -58.3816 },
      { latitud: -34.6042, longitud: -58.3822 },
      { latitud: -34.6047, longitud: -58.3828 }
    ];
    
    for (let i = 0; i < puntosGPS2.length; i++) {
      await prisma.puntoGPS.create({
        data: {
          paseoId: paseo2.id,
          latitud: puntosGPS2[i].latitud,
          longitud: puntosGPS2[i].longitud,
          timestamp: new Date(Date.now() - (puntosGPS2.length - i) * 60000),
          precision: 5.0,
          velocidad: 1.2
        }
      });
    }
    
    // El paseo 3 no tendrá puntos GPS (simula el problema)
    
    console.log('✅ Datos de prueba creados exitosamente:');
    console.log(`- Usuario dueño: ${dueno.email} (contraseña: 123456)`);
    console.log(`- Usuario paseador: ${paseador.email} (contraseña: 123456)`);
    console.log(`- Mascota: ${mascota.nombre}`);
    console.log(`- Paseo 1: ${puntosGPS1.length} puntos GPS`);
    console.log(`- Paseo 2: ${puntosGPS2.length} puntos GPS`);
    console.log(`- Paseo 3: 0 puntos GPS`);
    
  } catch (error) {
    console.error('Error creando datos de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
import { Server } from 'socket.io';
import { prisma } from '../base_datos/conexion';

interface Coordenada {
  paseoId: number;
  lat: number;
  lng: number;
}

export function registrarSocketGPS(io: Server): void {
  io.on('connection', (socket) => {
    // Manejar la conexión de un cliente

    // Escuchar suscripción a paseo específico
    socket.on('unirse-a-paseo', async (paseoId: number) => {
      socket.join(`paseo-${paseoId}`);

      // Emitir ubicación origen al paseador al conectarse
      const paseo = await prisma.paseo.findUnique({ where: { id: paseoId } });
      if (paseo?.origenLatitud && paseo?.origenLongitud) {
        io.to(`paseo-${paseoId}`).emit('ubicacion-origen', {
          lat: paseo.origenLatitud,
          lng: paseo.origenLongitud
        });
      }
    });

    // Registrar coordenada en tiempo real
    socket.on('nueva-coordenada', async (data: Coordenada) => {
      const { paseoId, lat, lng } = data;

      try {
        await prisma.puntoGPS.create({
          data: {
            paseoId,
            latitud: lat,
            longitud: lng,
            timestamp: new Date(),
          },
        });

        // Emitir coordenada a todos los conectados a ese paseo
        io.to(`paseo-${paseoId}`).emit('ubicacion-paseador', { lat, lng });
      } catch (error) {
        console.error('❌ Error al guardar punto GPS:', error);
      }
    });

    socket.on('updateLocation', (data) => {
      // Lógica para manejar la actualización de la ubicación del paseador

      // Emitir la ubicación a otros clientes (ej. dueños de mascotas, otros paseadores)
      // socket.broadcast.emit('locationUpdate', data);
    });

    // Manejar la desconexión de un cliente
    socket.on('disconnect', () => {
    });
  });
}

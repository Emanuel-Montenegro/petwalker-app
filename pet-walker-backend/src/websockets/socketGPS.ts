import { Server } from 'socket.io';
import { prisma } from '../base_datos/conexion';
import { throttle } from 'lodash';

interface Coordenada {
  paseoId: number;
  lat: number;
  lng: number;
  precision?: number;
  velocidad?: number;
  altitud?: number;
  bateria?: number;
}

// Mapa para trackear última actualización por paseo
const ultimasActualizaciones = new Map<number, number>();
const MIN_INTERVALO = 2000; // Mínimo 2 segundos entre updates

// Función para comprimir coordenadas
const comprimirCoordenada = (coord: Coordenada): any => ({
  p: coord.paseoId,
  t: Date.now(),
  c: [
    Math.round(coord.lat * 1e6) / 1e6,
    Math.round(coord.lng * 1e6) / 1e6,
    coord.precision ? Math.round(coord.precision) : null,
    coord.velocidad ? Math.round(coord.velocidad * 10) / 10 : null,
    coord.altitud ? Math.round(coord.altitud) : null,
    coord.bateria
  ]
});

// Función para descomprimir coordenadas
const descomprimirCoordenada = (data: any): Coordenada => ({
  paseoId: data.p,
  lat: data.c[0],
  lng: data.c[1],
  precision: data.c[2],
  velocidad: data.c[3],
  altitud: data.c[4],
  bateria: data.c[5]
});

export function registrarSocketGPS(io: Server): void {
  // Mapa de conexiones activas por paseo
  const conexionesPorPaseo = new Map<number, Set<string>>();

  io.on('connection', (socket) => {
    const paseosSuscriptos = new Set<number>();

    // Throttle para emisión de coordenadas
    const emitirCoordenada = throttle((paseoId: number, coordenada: Coordenada) => {
      const room = `paseo-${paseoId}`;
      io.to(room).emit('ubicacion-paseador', comprimirCoordenada(coordenada));
    }, MIN_INTERVALO, { leading: true, trailing: true });

    socket.on('unirse-a-paseo', async (paseoId: number) => {
      try {
        const paseo = await prisma.paseo.findUnique({
          where: { id: paseoId },
          select: {
            id: true,
            estado: true,
            origenLatitud: true,
            origenLongitud: true
          }
        });

        if (!paseo || paseo.estado !== 'EN_CURSO') {
          socket.emit('error', { mensaje: 'Paseo no encontrado o no está en curso' });
          return;
        }

        const room = `paseo-${paseoId}`;
        socket.join(room);
        paseosSuscriptos.add(paseoId);

        // Registrar conexión
        if (!conexionesPorPaseo.has(paseoId)) {
          conexionesPorPaseo.set(paseoId, new Set());
        }
        conexionesPorPaseo.get(paseoId)!.add(socket.id);

        // Enviar ubicación origen
        if (paseo.origenLatitud && paseo.origenLongitud) {
          socket.emit('ubicacion-origen', {
            lat: paseo.origenLatitud,
            lng: paseo.origenLongitud
          });
        }

        // Enviar últimos puntos
        const ultimosPuntos = await prisma.puntoGPS.findMany({
          where: { paseoId },
          orderBy: { timestamp: 'desc' },
          take: 20
        });

        if (ultimosPuntos.length > 0) {
          socket.emit('historial-ubicaciones', ultimosPuntos.map(p => ({
            lat: p.latitud,
            lng: p.longitud,
            timestamp: p.timestamp
          })));
        }
      } catch (error) {
        console.error('Error al unirse a paseo:', error);
        socket.emit('error', { mensaje: 'Error al unirse al paseo' });
      }
    });

    socket.on('nueva-coordenada', async (data: Coordenada) => {
      const { paseoId } = data;
      const ultimaActualizacion = ultimasActualizaciones.get(paseoId) || 0;
      const ahora = Date.now();

      if (ahora - ultimaActualizacion < MIN_INTERVALO) {
        return; // Ignorar actualizaciones muy frecuentes
      }

      try {
        // Validar que el paseo esté en curso
        const paseo = await prisma.paseo.findUnique({
          where: { id: paseoId },
          select: { estado: true }
        });

        if (!paseo || paseo.estado !== 'EN_CURSO') {
          socket.emit('error', { mensaje: 'Paseo no encontrado o no está en curso' });
          return;
        }

        ultimasActualizaciones.set(paseoId, ahora);
        emitirCoordenada(paseoId, data);
      } catch (error) {
        console.error('Error al procesar nueva coordenada:', error);
      }
    });

    socket.on('disconnect', () => {
      // Limpiar conexiones
      paseosSuscriptos.forEach(paseoId => {
        const conexiones = conexionesPorPaseo.get(paseoId);
        if (conexiones) {
          conexiones.delete(socket.id);
          if (conexiones.size === 0) {
            conexionesPorPaseo.delete(paseoId);
          }
        }
      });
    });
  });
}

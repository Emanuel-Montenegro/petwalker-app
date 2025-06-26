import { Request, Response } from 'express';
import { prisma } from '../base_datos/conexion';
import { RequestConUsuario } from '../types/express';

export const registrarPuntoGPS = async (req: RequestConUsuario, res: Response) => {
  const { paseoId, latitud, longitud } = req.body;

  try {
    const paseo = await prisma.paseo.findUnique({
      where: { id: paseoId }
    });

    if (!paseo) {
      return res.status(404).json({ mensaje: 'Paseo no encontrado' });
    }

    if (paseo.estado !== 'EN_CURSO') {
      return res.status(400).json({ mensaje: 'Solo se pueden registrar puntos si el paseo está en curso' });
    }

    if (paseo.paseadorId !== req.usuario!.id) {
      return res.status(403).json({ mensaje: 'No tenés permiso para registrar puntos en este paseo' });
    }

    const punto = await prisma.puntoGPS.create({
      data: {
        paseoId,
        latitud,
        longitud
      }
    });

    res.status(201).json({ mensaje: 'Punto GPS registrado', punto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar el punto GPS' });
  }
};

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const rad = (deg: number) => (deg * Math.PI) / 180;

  const φ1 = rad(lat1);
  const φ2 = rad(lat2);
  const Δφ = rad(lat2 - lat1);
  const Δλ = rad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const obtenerPuntosGPS = async (req: RequestConUsuario, res: Response) => {
  const paseoId = parseInt(req.params.paseoId);

  try {
    const paseo = await prisma.paseo.findUnique({
      where: { id: paseoId },
      include: { mascota: true }
    });

    if (!paseo) {
      return res.status(404).json({ mensaje: 'Paseo no encontrado' });
    }

    const esPaseador = paseo.paseadorId === req.usuario!.id;
    const esDueno = paseo.mascota.usuarioId === req.usuario!.id;

    if (!esPaseador && !esDueno) {
      return res.status(403).json({ mensaje: 'No tenés acceso a este recorrido' });
    }

    const puntos = await prisma.puntoGPS.findMany({
      where: { paseoId },
      orderBy: { timestamp: 'asc' }
    });

    let distanciaTotal = 0;
    const coordenadas: [number, number][] = [];

    for (let i = 0; i < puntos.length; i++) {
      const punto = puntos[i];
      coordenadas.push([punto.longitud, punto.latitud]);

      if (i > 0) {
        const a = puntos[i - 1];
        const b = puntos[i];
        distanciaTotal += calcularDistancia(a.latitud, a.longitud, b.latitud, b.longitud);
      }
    }

    res.json({
      paseoId,
      distanciaTotal: Math.round(distanciaTotal),
      coordenadas,
      puntos
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener los puntos GPS' });
  }
};

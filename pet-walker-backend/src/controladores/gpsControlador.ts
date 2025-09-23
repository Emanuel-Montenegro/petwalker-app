import { Request, Response } from 'express';
import { prisma } from '../base_datos/conexion';
import { RequestConUsuario } from '../types/express';
import { PuntoGPS } from '@prisma/client';

// Cache en memoria para puntos recientes (últimas 2 horas)
const puntosRecientesCache = new Map<number, PuntoGPS[]>();
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 horas

// Limpiar cache periódicamente
setInterval(() => {
  const dosHorasAtras = Date.now() - CACHE_DURATION;
  puntosRecientesCache.forEach((puntos, paseoId) => {
    // Limpiar puntos viejos
    const puntosRecientes = puntos.filter(p => p.timestamp.getTime() > dosHorasAtras);
    if (puntosRecientes.length === 0) {
      puntosRecientesCache.delete(paseoId);
    } else {
      puntosRecientesCache.set(paseoId, puntosRecientes);
    }
  });
}, 5 * 60 * 1000);

// Función para calcular distancia entre dos puntos
const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Radio de la tierra en metros
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distancia en metros
};

export const registrarPuntoGPS = async (req: RequestConUsuario, res: Response) => {
  const { paseoId, latitud, longitud, precision, velocidad, altitud, bateria } = req.body;

  try {
    const paseo = await prisma.paseo.findUnique({
      where: { id: paseoId },
      select: { 
        id: true, 
        estado: true, 
        paseadorId: true,
        origenLatitud: true,
        origenLongitud: true
      }
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

    // Validar distancia con punto origen (si es el primer punto)
    if (paseo.origenLatitud && paseo.origenLongitud) {
      const distancia = calcularDistancia(paseo.origenLatitud, paseo.origenLongitud, latitud, longitud);
      if (distancia > 1000) { // Más de 1km del origen
        return res.status(400).json({ 
          mensaje: 'El punto está muy lejos del origen del paseo',
          distancia: Math.round(distancia)
        });
      }
    }

    // Crear el punto GPS con los campos opcionales
    const punto = await prisma.puntoGPS.create({
      data: {
        paseoId,
        latitud,
        longitud,
        ...(precision !== undefined && { precision }),
        ...(velocidad !== undefined && { velocidad }),
        ...(altitud !== undefined && { altitud }),
        ...(bateria !== undefined && { bateria })
      }
    });

    // Actualizar cache
    const puntosActuales = puntosRecientesCache.get(paseoId) || [];
    puntosRecientesCache.set(paseoId, [...puntosActuales, punto]);

    res.status(201).json({ mensaje: 'Punto GPS registrado', punto });
  } catch (error) {

    res.status(500).json({ mensaje: 'Error al registrar el punto GPS' });
  }
};

export const obtenerPuntosGPS = async (req: RequestConUsuario, res: Response) => {
  const paseoId = parseInt(req.params.paseoId);

  try {
    const paseo = await prisma.paseo.findUnique({
      where: { id: paseoId },
      select: {
        id: true,
        estado: true,
        paseadorId: true,
        mascota: {
          select: {
            usuarioId: true
          }
        }
      }
    });

    if (!paseo) {
      return res.status(404).json({ mensaje: 'Paseo no encontrado' });
    }

    const esPaseador = paseo.paseadorId === req.usuario!.id;
    const esDueno = paseo.mascota.usuarioId === req.usuario!.id;

    if (!esPaseador && !esDueno) {
      return res.status(403).json({ mensaje: 'No tenés acceso a este recorrido' });
    }

    // Intentar obtener de cache primero
    let puntos = puntosRecientesCache.get(paseoId);
    
    // Si no está en cache o el paseo no está en curso, traer de DB
    if (!puntos || paseo.estado !== 'EN_CURSO') {
      puntos = await prisma.puntoGPS.findMany({
        where: { paseoId },
        orderBy: { timestamp: 'asc' },
        take: 1000 // Limitar cantidad de puntos históricos
      });

      // Si está en curso, guardar en cache
      if (paseo.estado === 'EN_CURSO') {
        puntosRecientesCache.set(paseoId, puntos);
      }
    }

    // Calcular métricas
    let distanciaTotal = 0;
    const coordenadas: [number, number][] = [];
    let velocidadPromedio = 0;
    let puntosConVelocidad = 0;

    for (let i = 0; i < puntos.length; i++) {
      const punto = puntos[i];
      coordenadas.push([punto.longitud, punto.latitud]);

      if (i > 0) {
        const puntoAnterior = puntos[i - 1];
        const puntoActual = puntos[i];
        const dist = calcularDistancia(
          puntoAnterior.latitud, 
          puntoAnterior.longitud, 
          puntoActual.latitud, 
          puntoActual.longitud
        );
        
        if (dist < 100) { // Filtrar saltos imposibles (>100m entre puntos)
          distanciaTotal += dist;
          if (puntoActual.velocidad !== null) {
            velocidadPromedio += puntoActual.velocidad;
            puntosConVelocidad++;
          }
        }
      }
    }

    velocidadPromedio = puntosConVelocidad > 0 ? velocidadPromedio / puntosConVelocidad : 0;

    res.json({
      paseoId,
      distanciaTotal: Math.round(distanciaTotal),
      velocidadPromedio: Math.round(velocidadPromedio * 10) / 10,
      coordenadas: coordenadas.slice(-100), // Últimos 100 puntos para el mapa
      ultimoPunto: puntos[puntos.length - 1],
      cantidadPuntos: puntos.length
    });

  } catch (error) {

    res.status(500).json({ mensaje: 'Error al obtener los puntos GPS' });
  }
};

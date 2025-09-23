import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { RequestConUsuario } from '../types/express';
import { Rol } from '@prisma/client';
import { generarFactura } from './facturasControlador';
import { emitirNotificacionUsuario } from '../websockets/socketNotifications';
import { Server } from 'socket.io';
import { logger } from '../utils/logger';
import { asyncHandler } from '../utils/asyncHandler';

export const crearPaseo = asyncHandler(async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { mascotaId, fecha, origenLatitud, origenLongitud, horaInicio, hora, duracion, tipoServicio, precio } = req.body;

  // Soporte tolerante: aceptar 'horaInicio' o 'hora'
  const horaFinal = horaInicio || hora;
  if (!horaFinal || typeof horaFinal !== 'string' || !/^\d{2}:\d{2}$/.test(horaFinal)) {
    res.status(400).json({ mensaje: 'El campo horaInicio (o hora) es obligatorio y debe tener formato HH:mm' });
    return;
  }

  try {
    // Convertir la fecha y hora a objetos Date
    const fechaPaseo = new Date(fecha);
    fechaPaseo.setUTCHours(0, 0, 0, 0); // Normalizar a la medianoche UTC

    // Calcular hora de inicio y fin del nuevo paseo
    const [h, m] = horaFinal.split(":").map(Number);
    const inicioNuevo = new Date(fechaPaseo);
    inicioNuevo.setHours(h, m, 0, 0);
    const finNuevo = new Date(inicioNuevo.getTime() + duracion * 60000);

    // Buscar paseos existentes de la misma mascota ese día
    const paseosMismaMascota = await prisma.paseo.findMany({
      where: {
        mascotaId: mascotaId,
        fecha: fechaPaseo,
        estado: { in: ['PENDIENTE', 'ACEPTADO', 'EN_CURSO'] }
      }
    });

    // Validar superposición
    for (const paseo of paseosMismaMascota) {
      const [hExist, mExist] = paseo.horaInicio.split(":").map(Number);
      const inicioExist = new Date(fechaPaseo);
      inicioExist.setHours(hExist, mExist, 0, 0);
      const finExist = new Date(inicioExist.getTime() + paseo.duracion * 60000);
      // Si se solapan
      if (inicioNuevo < finExist && finNuevo > inicioExist) {
        res.status(409).json({ mensaje: 'La mascota ya tiene un paseo que se superpone en ese horario.' });
        return;
      }
    }

    const paseo = await prisma.paseo.create({
      data: {
        fecha: new Date(fecha),
        mascotaId,
        origenLatitud,
        origenLongitud,
        horaInicio: horaFinal,
        duracion,
        tipoServicio,
        precio,
      }
    });
  

    res.status(201).json({ mensaje: 'Paseo creado', paseo });
  } catch (error) {
    logger.error('PASEO', 'Error al crear el paseo', error);
    res.status(500).json({ mensaje: 'Error al crear el paseo' });
  }
});

export const obtenerPaseos = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const paseos = await prisma.paseo.findMany({
      where: { 
        estado: 'PENDIENTE',
        paseadorId: null 
      },
      select: {
        id: true,
        fecha: true,
        horaInicio: true,
        duracion: true,
        estado: true,
        mascotaId: true,
        paseadorId: true,
        tipoServicio: true,
        precio: true,
        mascota: {
          select: {
            id: true,
            nombre: true,
            especie: true,
            raza: true,
            edad: true,
            usuarioId: true,
          }
        }
      }
    });

    res.json(paseos);
  } catch (error) {
    logger.error('PASEO', 'Error al obtener paseos', error);
    res.status(500).json({ mensaje: 'Error al obtener paseos' });
  }
});

export const aceptarPaseo = async (req: RequestConUsuario & { io?: Server }, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Primero verificamos que el paseo esté disponible
    const paseoExistente = await prisma.paseo.findUnique({
      where: { id: parseInt(id) },
      select: { estado: true, paseadorId: true }
    });

    if (!paseoExistente) {
      res.status(404).json({ mensaje: 'Paseo no encontrado' });
      return;
    }

    if (paseoExistente.estado !== 'PENDIENTE' || paseoExistente.paseadorId !== null) {
      res.status(400).json({ mensaje: 'Este paseo ya no está disponible' });
      return;
    }

    // Actualizamos el paseo con el nuevo paseador
    const paseo = await prisma.paseo.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'ACEPTADO',
        paseadorId: req.usuario!.id,
      },
      include: {
        mascota: true,
      },
    });

    // Buscar el dueño de la mascota
    const duenioId = paseo.mascota.usuarioId;
    const mensaje = `Tu paseo para ${paseo.mascota.nombre} fue aceptado por un paseador.`;
    const notificacion = await prisma.notification.create({
      data: {
        usuarioId: duenioId,
        mensaje,
        tipo: 'PASEO_ACEPTADO',
        data: { paseoId: paseo.id },
      },
    });

    // Emitir notificación en tiempo real si el socket está disponible
    if (req.app && req.app.get('io')) {
      
      emitirNotificacionUsuario(req.app.get('io'), duenioId, notificacion);
    }

    res.json({ mensaje: 'Paseo aceptado', paseo });
  } catch (error) {
    logger.error('PASEO', 'Error al aceptar el paseo', error);
    res.status(500).json({ mensaje: 'Error al aceptar el paseo' });
  }
};

export const obtenerMisPaseosComoDueno = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { estado, desde, hasta } = req.query;

  try {
    const mascotas = await prisma.mascota.findMany({
      where: { usuarioId: req.usuario!.id },
      select: { id: true }
    });

    const mascotaIds = mascotas.map(m => m.id);

    const where: any = {
      mascotaId: { in: mascotaIds }
    };

    if (estado) where.estado = estado;
    if (desde) where.fecha = { ...where.fecha, gte: new Date(desde as string) };
    if (hasta) where.fecha = { ...where.fecha, lte: new Date(hasta as string) };

    const paseos = await prisma.paseo.findMany({
      where,
      include: {
        mascota: true,
        paseador: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        calificacion: true
      },
      orderBy: [{ fecha: 'desc' }, { horaInicio: 'desc' }]
    });

    res.json({ paseos });
  } catch (error) {
    logger.error('PASEO', 'Error al obtener tus paseos', error);
    res.status(500).json({ mensaje: 'Error al obtener tus paseos' });
  }
};

export const obtenerMisPaseosComoPaseador = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { estado, desde, hasta } = req.query;

  try {
    const where: any = {
      paseadorId: req.usuario!.id
    };

    if (estado) where.estado = estado;
    if (desde) where.fecha = { ...where.fecha, gte: new Date(desde as string) };
    if (hasta) where.fecha = { ...where.fecha, lte: new Date(hasta as string) };

    const paseos = await prisma.paseo.findMany({
      where,
      include: {
        mascota: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true
              }
            }
          }
        },
        calificacion: true
      },
      orderBy: [{ fecha: 'desc' }, { horaInicio: 'desc' }]
    });

    // Siempre responder 200 y array vacío si no hay paseos
    res.status(200).json({ paseos });
  } catch (error) {
    logger.error('PASEO', 'Error al obtener tus paseos como paseador', error);
    res.status(500).json({ mensaje: 'Error al obtener tus paseos como paseador' });
  }
};

export const iniciarPaseo = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const paseo = await prisma.paseo.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'EN_CURSO'
      }
    });

    res.json({ mensaje: 'Paseo iniciado', paseo });
  } catch (error) {
    logger.error('PASEO', 'Error al iniciar el paseo', error);
    res.status(500).json({ mensaje: 'Error al iniciar el paseo' });
  }
};

export const finalizarPaseo = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Verificar el estado actual del paseo antes de actualizarlo
    const paseoActual = await prisma.paseo.findUnique({
      where: { id: parseInt(id) },
      select: { estado: true }
    });

    if (!paseoActual) {
      res.status(404).json({ mensaje: 'Paseo no encontrado' });
      return;
    }

    if (paseoActual.estado === 'FINALIZADO') {
      res.status(400).json({ mensaje: 'El paseo ya está finalizado' });
      return;
    }

    const paseo = await prisma.paseo.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'FINALIZADO'
      },
      include: {
        mascota: {
          include: {
            usuario: true
          }
        }
      }
    });

    // Generar factura
    await generarFactura(paseo.id);

    // Notificar al dueño
    if (req.app && req.app.get('io')) {
      const notificacion = await prisma.notification.create({
        data: {
          usuarioId: paseo.mascota.usuario.id,
          mensaje: `Tu paseo con ${paseo.mascota.nombre} ha finalizado.`,
          tipo: 'PASEO_FINALIZADO',
          data: { paseoId: paseo.id }
        }
      });
      emitirNotificacionUsuario(req.app.get('io'), paseo.mascota.usuario.id, notificacion);
    }

    res.json({ mensaje: 'Paseo finalizado', paseo });
  } catch (error) {
    logger.error('PASEO', 'Error al finalizar el paseo', error);
    res.status(500).json({ mensaje: 'Error al finalizar el paseo' });
  }
};

export const cancelarPaseo = async (req: RequestConUsuario, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const paseo = await prisma.paseo.findUnique({
      where: { id: parseInt(id) }
    });

    if (!paseo) {
      res.status(404).json({ mensaje: 'Paseo no encontrado' });
      return;
    }

    if (paseo.estado === 'EN_CURSO' || paseo.estado === 'FINALIZADO') {
      res.status(400).json({ mensaje: 'No se puede cancelar un paseo en curso o finalizado' });
      return;
    }

    const usuario = req.usuario!;

    const esDueño = usuario.rol === 'DUENO';
    const esPaseador = usuario.rol === 'PASEADOR' && paseo?.paseadorId === usuario.id;

    if (!esDueño && !esPaseador) {
      res.status(403).json({ mensaje: 'No tenés permisos para cancelar este paseo' });
      return;
    }

    await prisma.paseo.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'CANCELADO',
        canceladoPorRol: usuario.rol as Rol,
        canceladoEn: new Date()
      }
    });

    res.status(200).json({ mensaje: 'Paseo cancelado exitosamente' });
  } catch (error) {
    logger.error('PASEO', 'Error al cancelar el paseo', error);
    res.status(500).json({ mensaje: 'Error al cancelar el paseo' });
  }
};

// Obtener un paseo por ID (migrado desde paseoControlador.ts)
export const obtenerPaseoPorId = asyncHandler(async (req: RequestConUsuario, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const paseo = await prisma.paseo.findUnique({
      where: { id: Number(id) },
      include: {
        mascota: true,
        paseador: true
      }
    });

    if (!paseo) {
      res.status(404).json({ mensaje: 'Paseo no encontrado' });
      return;
    }

    // Verificar permisos
    if (paseo.mascota.usuarioId !== req.usuario?.id && paseo.paseadorId !== req.usuario?.id) {
      res.status(403).json({ mensaje: 'No tienes permiso para ver este paseo' });
      return;
    }

    res.json(paseo);
  } catch (error) {
    logger.error('PASEO', 'Error al obtener paseo', error);
    res.status(500).json({ mensaje: 'Error al obtener paseo' });
  }
});

export const limpiarHistorialPaseos = async (req: RequestConUsuario, res: Response): Promise<void> => {
  try {
    const { id: usuarioId, rol } = req.usuario!;

    // Obtener los IDs de los paseos a eliminar
    let paseosAEliminar: { id: number }[] = [];
    if (rol === 'DUENO') {
      const mascotas = await prisma.mascota.findMany({
        where: { usuarioId },
        select: { id: true }
      });
      const mascotaIds = mascotas.map(m => m.id);
      paseosAEliminar = await prisma.paseo.findMany({
        where: {
          mascotaId: { in: mascotaIds },
          estado: 'FINALIZADO'
        },
        select: { id: true }
      });
    } else if (rol === 'PASEADOR') {
      paseosAEliminar = await prisma.paseo.findMany({
        where: {
          paseadorId: usuarioId,
          estado: 'FINALIZADO'
        },
        select: { id: true }
      });
    }

    if (!paseosAEliminar?.length) {
      res.json({ mensaje: 'No hay paseos para eliminar' });
      return;
    }

    const paseoIds = paseosAEliminar.map(p => p.id);

    // Eliminar registros relacionados
    await prisma.$transaction([
      prisma.puntoGPS.deleteMany({
        where: { paseoId: { in: paseoIds } }
      }),
      prisma.calificacion.deleteMany({
        where: { paseoId: { in: paseoIds } }
      }),
      prisma.factura.deleteMany({
        where: { paseoId: { in: paseoIds } }
      }),
      prisma.paseo.deleteMany({
        where: { id: { in: paseoIds } }
      })
    ]);

    res.json({ mensaje: `Se eliminaron ${paseosAEliminar.length} paseos del historial` });
  } catch (error) {
    logger.error('PASEO', 'Error al limpiar el historial de paseos', error);
    res.status(500).json({ mensaje: 'Error al limpiar el historial de paseos' });
  }
};

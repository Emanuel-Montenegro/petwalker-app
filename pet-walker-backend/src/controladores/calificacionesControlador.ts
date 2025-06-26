import { Request, Response } from 'express';
import { prisma } from '../base_datos/conexion';
import { RequestConUsuario } from '../types/express';
import { Rol } from '@prisma/client';

export const registrarCalificacion = async (req: RequestConUsuario, res: Response) => {
  const { paseoId, puntuacion, comentario } = req.body;

  try {
    const paseo = await prisma.paseo.findUnique({
      where: { id: paseoId },
      include: { paseador: true }
    });

    if (!paseo || paseo.estado !== 'FINALIZADO' || !paseo.paseadorId) {
      return res.status(400).json({ mensaje: 'El paseo no es válido para calificar' });
    }

    const calificacionExistente = await prisma.calificacion.findUnique({
      where: { paseoId }
    });

    if (calificacionExistente) {
      return res.status(409).json({ mensaje: 'Este paseo ya fue calificado' });
    }

    const calificacion = await prisma.calificacion.create({
      data: {
        paseoId,
        paseadorId: paseo.paseadorId,
        puntuacion,
        comentario
      }
    });

    res.status(201).json({ mensaje: 'Calificación registrada', calificacion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar la calificación' });
  }
};

export const obtenerCalificacionesDePaseador = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const calificaciones = await prisma.calificacion.findMany({
      where: { paseadorId: parseInt(id) },
      orderBy: { creadoEn: 'desc' }
    });

    res.json({ calificaciones });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener calificaciones' });
  }
};

export const obtenerPromedioDePaseador = async (req: Request, res: Response) => {
  const paseadorId = parseInt(req.params.id);

  try {
    const calificaciones = await prisma.calificacion.findMany({
      where: { paseadorId },
      select: { puntuacion: true }
    });

    if (calificaciones.length === 0) {
      return res.json({ paseadorId, promedio: 0, total: 0 });
    }

    const total = calificaciones.length;
    const suma = calificaciones.reduce((acc: number, curr: { puntuacion: number }) => acc + curr.puntuacion, 0);
    const promedio = parseFloat((suma / total).toFixed(2));

    res.json({ paseadorId, promedio, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al calcular promedio' });
  }
};




import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { RequestConUsuario } from '../types/express';

// Obtener todas las notificaciones del usuario autenticado
export const obtenerNotificaciones = async (req: RequestConUsuario, res: Response) => {
  try {
    const usuarioId = req.usuario!.id;
    const notificaciones = await prisma.notification.findMany({
      where: { usuarioId },
      orderBy: { creadaEn: 'desc' },
    });
    
    res.json(notificaciones);
  } catch (error) {

    res.status(500).json({ mensaje: 'Error al obtener notificaciones' });
  }
};

// Marcar todas las notificaciones como leídas
export const marcarTodasComoLeidas = async (req: RequestConUsuario, res: Response) => {
  try {
    const usuarioId = req.usuario!.id;
    await prisma.notification.updateMany({
      where: { usuarioId, leida: false },
      data: { leida: true },
    });
    res.json({ mensaje: 'Notificaciones marcadas como leídas' });
  } catch (error) {

    res.status(500).json({ mensaje: 'Error al marcar notificaciones como leídas' });
  }
};
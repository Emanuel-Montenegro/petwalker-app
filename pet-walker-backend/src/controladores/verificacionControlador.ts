import { Request, Response } from 'express';
import { prisma } from '../base_datos/conexion';
import { RequestConUsuario } from '../middlewares/authMiddleware';

export const subirVerificacion = async (req: RequestConUsuario, res: Response) => {
  const { files } = req;
  const usuarioId = req.usuario!.id;

  const imagenFrente = (files as any).frente?.[0]?.filename;
  const imagenDorso = (files as any).dorso?.[0]?.filename;

  if (!imagenFrente || !imagenDorso) {
    return res.status(400).json({ mensaje: 'Ambas imágenes son requeridas' });
  }

  try {
    const existente = await prisma.verificacionDNI.findUnique({
      where: { usuarioId }
    });

    if (existente) {
      return res.status(400).json({ mensaje: 'Ya se envió una verificación de identidad' });
    }

    await prisma.verificacionDNI.create({
      data: {
        usuarioId,
        urlFrente: imagenFrente,
        urlDorso: imagenDorso,
      }
    });

    res.status(201).json({ mensaje: 'Verificación enviada. En revisión.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al procesar verificación' });
  }
};

export const cambiarEstadoVerificacion = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!['APROBADO', 'RECHAZADO'].includes(estado)) {
    return res.status(400).json({ mensaje: 'Estado inválido' });
  }

  try {
    const verificacion = await prisma.verificacionDNI.update({
      where: { id: parseInt(id) },
      data: { estado }
    });

    res.json({ mensaje: 'Estado actualizado', verificacion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar estado' });
  }
};

export const obtenerVerificaciones = async (_req: Request, res: Response) => {
  const verificaciones = await prisma.verificacionDNI.findMany({
    include: { usuario: true }
  });

  res.json(verificaciones);
};

import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { RequestConUsuario } from '../middleware/auth';

// Obtener todos los paseos
export const getPaseos = async (req: RequestConUsuario, res: Response) => {
  try {
    const paseos = await prisma.paseo.findMany({
      include: {
        mascota: true,
        paseador: true
      }
    });
    res.json(paseos);
  } catch (error) {
    throw new AppError('Error al obtener paseos', 500);
  }
};

// Obtener un paseo por ID
export const getPaseoById = async (req: RequestConUsuario, res: Response) => {
  try {
    const { id } = req.params;
    console.log('[PaseoControlador] getPaseoById - ID:', id);
    console.log('[PaseoControlador] getPaseoById - Usuario:', req.usuario);

    const paseo = await prisma.paseo.findUnique({
      where: { id: Number(id) },
      include: {
        mascota: true,
        paseador: true
      }
    });

    console.log('[PaseoControlador] getPaseoById - Paseo encontrado:', paseo);

    if (!paseo) {
      throw new AppError('Paseo no encontrado', 404);
    }

    // Verificar permisos
    console.log('[PaseoControlador] getPaseoById - Verificando permisos:');
    console.log('- Usuario ID:', req.usuario?.id);
    console.log('- Mascota Usuario ID:', paseo.mascota.usuarioId);
    console.log('- Paseador ID:', paseo.paseadorId);

    if (paseo.mascota.usuarioId !== req.usuario?.id && paseo.paseadorId !== req.usuario?.id) {
      console.log('[PaseoControlador] getPaseoById - Permiso denegado');
      throw new AppError('No tienes permiso para ver este paseo', 403);
    }

    console.log('[PaseoControlador] getPaseoById - Permiso concedido, enviando respuesta');
    res.json(paseo);
  } catch (error) {
    console.error('[PaseoControlador] getPaseoById - Error:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Error al obtener paseo', 500);
  }
};

// Obtener paseos por usuario
export const getPaseosByUsuario = async (req: RequestConUsuario, res: Response) => {
  try {
    const { usuarioId } = req.params;
    
    if (Number(usuarioId) !== req.usuario?.id) {
      throw new AppError('No tienes permiso para ver estos paseos', 403);
    }

    const paseos = await prisma.paseo.findMany({
      where: {
        mascota: {
          usuarioId: Number(usuarioId)
        }
      },
      include: {
        mascota: true,
        paseador: true
      }
    });

    res.json(paseos);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Error al obtener paseos del usuario', 500);
  }
};

// Obtener paseos por paseador
export const getPaseosByPaseador = async (req: RequestConUsuario, res: Response) => {
  try {
    const { paseadorId } = req.params;
    
    if (Number(paseadorId) !== req.usuario?.id) {
      throw new AppError('No tienes permiso para ver estos paseos', 403);
    }

    const paseos = await prisma.paseo.findMany({
      where: {
        paseadorId: Number(paseadorId)
      },
      include: {
        mascota: true,
        paseador: true
      }
    });

    res.json(paseos);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Error al obtener paseos del paseador', 500);
  }
};

// Crear un nuevo paseo
export const createPaseo = async (req: RequestConUsuario, res: Response) => {
  try {
    const { 
      mascotaId, 
      fecha, 
      horaInicio, 
      duracion, 
      tipoServicio, 
      precio,
      origenLatitud,
      origenLongitud
    } = req.body;

    // Verificar que la mascota pertenece al usuario
    const mascota = await prisma.mascota.findUnique({
      where: { id: mascotaId }
    });

    if (!mascota) {
      throw new AppError('Mascota no encontrada', 404);
    }

    if (mascota.usuarioId !== req.usuario?.id) {
      throw new AppError('No tienes permiso para crear paseos para esta mascota', 403);
    }

    const paseo = await prisma.paseo.create({
      data: {
        mascotaId,
        fecha,
        horaInicio,
        duracion,
        estado: 'PENDIENTE',
        tipoServicio,
        precio,
        origenLatitud,
        origenLongitud
      },
      include: {
        mascota: true,
        paseador: true
      }
    });

    res.status(201).json(paseo);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Error al crear paseo', 500);
  }
};

// Actualizar un paseo
export const updatePaseo = async (req: RequestConUsuario, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      fecha, 
      horaInicio, 
      duracion, 
      estado, 
      tipoServicio, 
      precio,
      paseadorId,
      origenLatitud,
      origenLongitud
    } = req.body;

    const paseoExistente = await prisma.paseo.findUnique({
      where: { id: Number(id) },
      include: {
        mascota: true
      }
    });

    if (!paseoExistente) {
      throw new AppError('Paseo no encontrado', 404);
    }

    // Verificar permisos
    if (paseoExistente.mascota.usuarioId !== req.usuario?.id && paseoExistente.paseadorId !== req.usuario?.id) {
      throw new AppError('No tienes permiso para actualizar este paseo', 403);
    }

    const paseo = await prisma.paseo.update({
      where: { id: Number(id) },
      data: {
        fecha,
        horaInicio,
        duracion,
        estado,
        tipoServicio,
        precio,
        paseadorId,
        origenLatitud,
        origenLongitud
      },
      include: {
        mascota: true,
        paseador: true
      }
    });

    res.json(paseo);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Error al actualizar paseo', 500);
  }
};

// Eliminar un paseo
export const deletePaseo = async (req: RequestConUsuario, res: Response) => {
  try {
    const { id } = req.params;

    const paseoExistente = await prisma.paseo.findUnique({
      where: { id: Number(id) },
      include: {
        mascota: true
      }
    });

    if (!paseoExistente) {
      throw new AppError('Paseo no encontrado', 404);
    }

    // Solo el dueño de la mascota puede eliminar el paseo
    if (paseoExistente.mascota.usuarioId !== req.usuario?.id) {
      throw new AppError('No tienes permiso para eliminar este paseo', 403);
    }

    await prisma.paseo.delete({
      where: { id: Number(id) }
    });

    res.json({ mensaje: 'Paseo eliminado exitosamente' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Error al eliminar paseo', 500);
  }
}; 
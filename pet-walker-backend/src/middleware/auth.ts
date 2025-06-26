import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { AppError } from './errorHandler';
import { Rol } from '@prisma/client';

// Extender la interfaz Request para incluir el usuario
export interface RequestConUsuario extends Request {
  usuario?: {
    id: number;
    email: string;
    rol: Rol;
  };
}

// Middleware para verificar el token JWT
export const authenticateToken = async (
  req: RequestConUsuario,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Leer token desde cookie (preferido) o header Authorization (fallback)
    let token = req.cookies?.token;
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Token no proporcionado', 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRETO || 'tu_secreto_jwt_super_seguro'
    ) as { userId: number; rol: Rol };

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        rol: true
      }
    });

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 401);
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Token inválido', 401));
      return;
    }
    next(error);
  }
};

// Middleware para verificar roles
export const requireRole = (roles: Rol[]) => {
  return (req: RequestConUsuario, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      next(new AppError('No autorizado', 401));
      return;
    }

    if (!roles.includes(req.usuario.rol)) {
      next(new AppError('No tienes permiso para realizar esta acción', 403));
      return;
    }

    next();
  };
};

// Middleware para verificar si el usuario es dueño del recurso
export const verificarPropietario = async (req: RequestConUsuario, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    // Verificar si el usuario es dueño del recurso
    const recurso = await prisma.mascota.findFirst({
      where: {
        id: parseInt(id),
        usuarioId: usuarioId
      }
    });

    if (!recurso) {
      return res.status(403).json({ mensaje: 'No tienes permiso para acceder a este recurso' });
    }

    next();
  } catch (error) {
    console.error('Error al verificar propiedad:', error);
    return res.status(500).json({ mensaje: 'Error al verificar permisos' });
  }
}; 
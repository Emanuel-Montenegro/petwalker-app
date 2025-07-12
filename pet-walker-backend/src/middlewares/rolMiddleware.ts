import { Response, NextFunction, RequestHandler } from 'express';
import { RequestConUsuario } from './authMiddleware';
import { Rol } from '@prisma/client';

export const verificarRol = (rolesPermitidos: Rol[]): RequestHandler => {
  return (req: RequestConUsuario, res: Response, next: NextFunction): void => {
    // Permitir solicitudes OPTIONS para CORS
    if (req.method === 'OPTIONS') {
      next();
      return;
    }

    if (!req.usuario) {
      res.status(401).json({ mensaje: 'Usuario no autenticado' });
      return;
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      res.status(403).json({ mensaje: 'No tienes permiso para realizar esta acción' });
      return;
    }

    next();
  };
};

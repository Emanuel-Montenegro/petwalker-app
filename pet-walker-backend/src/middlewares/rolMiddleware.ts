import { Request, Response, NextFunction } from 'express';
import { RequestConUsuario } from '../types/express';
import { Rol } from '@prisma/client';

export const verificarRol = (rolesPermitidos: Rol[]) => {
  return (req: RequestConUsuario, res: Response, next: NextFunction) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      res.status(403).json({ message: 'Acceso denegado: rol insuficiente' });
        return; 
      }
      next();
    };
  };

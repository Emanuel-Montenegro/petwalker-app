import { Request } from 'express';
import { Rol } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: number;
        email: string;
        rol: Rol;
      };
    }
  }
}

export type RequestConUsuario = Request & {
  usuario?: {
    id: number;
    email: string;
    rol: Rol;
  };
}; 
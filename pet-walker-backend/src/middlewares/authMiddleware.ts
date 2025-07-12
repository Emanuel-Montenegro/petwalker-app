import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { tokenManager } from '../utils/tokenManager';
import { authMonitor } from '../utils/authMonitor';
import { Rol } from '@prisma/client';

export interface RequestConUsuario extends Request {
  usuario?: {
    id: number;
    email: string;
    rol: Rol;
  };
}

export async function verificarToken(req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> {
  // Permitir solicitudes OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    next();
    return;
  }

  try {
    // Leer token desde cookie (preferido) o header Authorization (fallback)
    let token = req.cookies?.token;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      res.status(401).json({ message: 'No se proporcionó token de autenticación' });
      return;
    }

    // Verificar si el token ha sido revocado
    if (tokenManager.isTokenRevoked(token)) {
      const reason = tokenManager.getRevocationReason(token);
      res.status(401).json({ 
        message: 'Token inválido', 
        reason: reason || 'Token revocado'
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRETO || '') as {
      userId: number;
      rol: Rol;
    };

    // Buscar el usuario en la base de datos para obtener información completa
    const prisma = (await import('../lib/prisma')).default;
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        rol: true
      }
    });

    if (!usuario) {
      res.status(401).json({ message: 'Usuario no encontrado' });
      return;
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    console.error('Error en verificarToken:', error);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

export async function registrarLoginFallido(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Registrar el intento de login (asumiendo que es un intento fallido por ahora)
    authMonitor.recordLoginAttempt(req, false);
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(429).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

export async function registrarLoginExitoso(req: Request): Promise<void> {
  authMonitor.recordLoginAttempt(req, true);
}

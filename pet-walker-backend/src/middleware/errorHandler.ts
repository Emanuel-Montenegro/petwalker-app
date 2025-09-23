import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(
    public mensaje: string,
    public statusCode: number = 500
  ) {
    super(mensaje);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error | AppError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error for debugging (only in development)
  if (!isProduction) {
    console.error('Error details:', err);
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      mensaje: err.mensaje
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(400).json({
        mensaje: 'Ya existe un registro con ese valor único'
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        mensaje: 'Registro no encontrado'
      });
      return;
    }
    // Generic database error for production
    res.status(500).json({
      mensaje: isProduction ? 'Error de base de datos' : `Database error: ${err.code}`
    });
    return;
  }

  // Generic server error
  res.status(500).json({
    mensaje: isProduction ? 'Error interno del servidor' : err.message
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
};
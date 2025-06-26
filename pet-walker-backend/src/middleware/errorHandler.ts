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
  console.error('Error:', err);

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
  }

  res.status(500).json({
    mensaje: 'Error interno del servidor'
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
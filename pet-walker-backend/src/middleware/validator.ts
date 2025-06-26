import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, z } from 'zod';
import { AppError } from './errorHandler';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const mensajes = error.errors.map(err => err.message);
        next(new AppError(mensajes.join(', '), 400));
        return;
      }
      next(error);
    }
  };
};

// Esquemas de validación
export const mascotaSchema = {
  crear: z.object({
    body: z.object({
      nombre: z.string().min(1, 'El nombre es requerido'),
      especie: z.string().min(1, 'La especie es requerida'),
      raza: z.string().min(1, 'La raza es requerida'),
      edad: z.number().min(0, 'La edad debe ser un número positivo'),
      sociable: z.boolean(),
      usuarioId: z.number().int('El ID del usuario debe ser un número entero')
    })
  }),
  actualizar: z.object({
    body: z.object({
      nombre: z.string().min(1, 'El nombre es requerido').optional(),
      especie: z.string().min(1, 'La especie es requerida').optional(),
      raza: z.string().min(1, 'La raza es requerida').optional(),
      edad: z.number().min(0, 'La edad debe ser un número positivo').optional(),
      sociable: z.boolean().optional()
    })
  })
};

export const paseoSchema = {
  crear: z.object({
    body: z.object({
      mascotaId: z.number().int('El ID de la mascota debe ser un número entero'),
      fecha: z.string().datetime('La fecha debe ser una fecha válida'),
      horaInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
      duracion: z.number().min(15, 'La duración mínima es 15 minutos'),
      tipoServicio: z.string().min(1, 'El tipo de servicio es requerido'),
      precio: z.number().min(0, 'El precio debe ser un número positivo'),
      origenLatitud: z.number(),
      origenLongitud: z.number()
    })
  }),
  actualizar: z.object({
    body: z.object({
      estado: z.enum(['PENDIENTE', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO']).optional(),
      paseadorId: z.number().int('El ID del paseador debe ser un número entero').optional()
    })
  })
};

export const usuarioSchema = {
  registrar: z.object({
    body: z.object({
      nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
      email: z.string().email('Email inválido'),
      contraseña: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
      rol: z.enum(['DUENO', 'PASEADOR'])
    })
  }),
  login: z.object({
    body: z.object({
      email: z.string().email('Email inválido'),
      contraseña: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
    })
  })
}; 
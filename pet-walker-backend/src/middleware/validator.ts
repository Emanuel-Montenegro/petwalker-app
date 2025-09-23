import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, z } from 'zod';
import { AppError } from './errorHandler';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('🔍 Validando request:', {
        method: req.method,
        url: req.url,
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      console.log('✅ Validación exitosa');
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.log('❌ Error de validación:', {
          method: req.method,
          url: req.url,
          errors: error.errors,
          receivedData: {
            body: req.body,
            query: req.query,
            params: req.params
          }
        });
        
        const mensajes = error.errors.map(err => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        
        next(new AppError(`Errores de validación: ${mensajes.join(', ')}`, 400));
        return;
      }
      console.log('❌ Error no esperado en validación:', error);
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
      fecha: z.string().min(1, 'La fecha es requerida'), // Acepta formato yyyy-MM-dd
      horaInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
      hora: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido').optional(), // Para compatibilidad
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
      contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
      rol: z.enum(['DUENO', 'PASEADOR'])
    })
  }),
  login: z.object({
    body: z.object({
      email: z.string().email('Email inválido'),
      contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
    })
  })
};
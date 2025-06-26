import { Router } from 'express';
import { login, register, logout } from '../controladores/authControlador';
import { validate } from '../middleware/validator';
import { z } from 'zod';

const router = Router();

// Esquema de validación para login
const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    contraseña: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
  })
});

// Esquema de validación para registro
const registerSchema = z.object({
  body: z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    contraseña: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    rol: z.enum(['DUENO', 'PASEADOR'])
  })
});

// Rutas
router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.post('/logout', logout);

export default router; 
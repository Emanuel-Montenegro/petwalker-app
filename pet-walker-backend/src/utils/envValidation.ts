import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRETO: z.string()
    .min(32, { message: 'JWT_SECRETO debe tener al menos 32 caracteres.' })
    .refine(val => {
      const hexRegex = /^[0-9a-fA-F]+$/;
      return hexRegex.test(val) && val.length % 2 === 0;
    }, { message: 'JWT_SECRETO debe ser una cadena hexadecimal válida de longitud par.' }),
  PORT: z.string().transform(Number).default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(6),
  NEXT_PUBLIC_BACKEND_URL: z.string().url().optional(),
});

type Env = z.infer<typeof envSchema>;

export const validateEnv = (): Env => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    process.exit(1);
  }
};

// Función para generar una clave JWT segura
export const generateSecureJwtKey = (): string => {
  const crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex');
};

// Función para validar la fortaleza de una clave JWT existente
export const isValidJwtKey = (key: string): boolean => {
  return envSchema.shape.JWT_SECRETO.safeParse(key).success;
};


import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { AppError } from './errorHandler';

// Configuración de CORS
export const corsOptions: cors.CorsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 horas
};

// Configuración de rate limiting
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // límite de 500 peticiones por ventana
  skip: (req) => {
    // Excluir rutas de login y registro del rate limiting
    return [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
    ].includes(req.path);
  },
  message: {
    status: 'error',
    mensaje: 'Estás haciendo muchas acciones muy rápido. Espera unos segundos y vuelve a intentar. Si el problema persiste, recarga la página.'
  }
});

// Configuración de Helmet
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000']
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
});

// Middleware para sanitizar datos de entrada
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitizar body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      });
    }

    // Sanitizar query params
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = (req.query[key] as string).trim();
        }
      });
    }

    next();
  } catch (error) {
    next(new AppError('Error al sanitizar datos de entrada', 400));
  }
};

// Middleware para prevenir ataques de timing
export const preventTimingAttacks = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration < 100) {
      // Añadir un pequeño retraso aleatorio para prevenir ataques de timing
      setTimeout(() => {}, Math.random() * 100);
    }
  });
  next();
}; 
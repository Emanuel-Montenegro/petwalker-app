import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import prisma from './lib/prisma';
import { validateEnv } from './utils/envValidation';
import { registrarSocketGPS } from './websockets/socketGPS';
import { registrarSocketNotificaciones } from './websockets/socketNotifications';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { corsOptions, limiter, helmetConfig, sanitizeInput, preventTimingAttacks } from './middleware/security';
import cookieParser from 'cookie-parser';

// Importar rutas
import authRoutes from './routes/authRutas';
import userRoutes from './routes/usuariosRutas';
import petRoutes from './routes/mascotasRutas';
import walkRoutes from './routes/paseosRutas';
import ratingRoutes from './routes/calificacionesRutas';
import certificateRoutes from './routes/certificadosRutas';
import invoiceRoutes from './routes/facturasRutas';
import gpsRoutes from './routes/gpsRutas';
import verificationRoutes from './routes/verificacionRutas';
import seguridadRoutes from './routes/seguridadRutas';
import notificationsRoutes from './routes/notificacionesRutas';

dotenv.config();

const env = validateEnv();
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*', 
  },
});

// Middleware de seguridad
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeInput);
app.use(preventTimingAttacks);

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/mascotas', petRoutes);
app.use('/api/paseos', walkRoutes);
app.use('/api/calificaciones', ratingRoutes);
app.use('/api/certificados', certificateRoutes);
app.use('/api/facturas', invoiceRoutes);
app.use('/api/gps', gpsRoutes);
app.use('/api/verificacion', verificationRoutes);
app.use('/api/seguridad', seguridadRoutes);
app.use('/api/notifications', notificationsRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente!' });
});

// Middleware de manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

// Configurar WebSocket
registrarSocketGPS(io);
registrarSocketNotificaciones(io);

// Iniciar servidor
const PORT = env.PORT;
httpServer.listen(PORT, () => {
  console.log('\x1b[42m%s\x1b[0m', '==========================================');
  console.log('\x1b[42m%s\x1b[0m', '🚀 Backend iniciado exitosamente');
  console.log('\x1b[42m%s\x1b[0m', `📡 Servidor corriendo en: http://localhost:${PORT}`);
  console.log('\x1b[42m%s\x1b[0m', '==========================================');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (error: Error) => {
  console.error('Error no manejado:', error);
  process.exit(1);
});

export { prisma };

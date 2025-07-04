import { Router } from 'express';
import { verificarToken } from '../middlewares/authMiddleware';
import { verificarRol } from '../middlewares/rolMiddleware';
import { 
  getBusinessMetrics, 
  getSystemMetrics, 
  getActivityMetrics 
} from '../controladores/metricsControlador';

const router = Router();

// Función auxiliar para manejar errores asíncronos en Express
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Todas las rutas requieren autenticación y rol ADMIN
router.use(verificarToken);
router.use(verificarRol(['ADMIN']));

// 📊 Métricas de negocio
router.get('/business', asyncHandler(getBusinessMetrics));

// 🔧 Métricas del sistema
router.get('/system', asyncHandler(getSystemMetrics));

// 📈 Actividad reciente
router.get('/activity', asyncHandler(getActivityMetrics));

export default router; 
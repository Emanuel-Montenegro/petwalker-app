import { Router } from 'express';
import { verificarToken } from '../middlewares/authMiddleware';
import {
  registrarCalificacion,
  obtenerCalificacionesDePaseador,
  obtenerPromedioDePaseador
} from '../controladores/calificacionesControlador';

const router = Router();

// Helper para manejar funciones async
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.use(verificarToken);

router.post('/', asyncHandler(registrarCalificacion));
router.get('/paseador/:id', asyncHandler(obtenerCalificacionesDePaseador));
router.get('/paseador/:id/promedio', asyncHandler(obtenerPromedioDePaseador));


export default router;

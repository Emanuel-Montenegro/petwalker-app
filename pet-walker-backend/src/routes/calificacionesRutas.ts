import { Router } from 'express';
import { verificarToken } from '../middlewares/authMiddleware';
import { 
  registrarCalificacion, 
  obtenerCalificacionesDePaseador, 
  obtenerPromedioDePaseador 
} from '../controladores/calificacionesControlador';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(verificarToken);

router.post('/', asyncHandler(registrarCalificacion));
router.get('/paseador/:id', asyncHandler(obtenerCalificacionesDePaseador));
router.get('/paseador/:id/promedio', asyncHandler(obtenerPromedioDePaseador));


export default router;

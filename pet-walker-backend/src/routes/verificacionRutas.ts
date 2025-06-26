import { Router } from 'express';
import { subirDNI } from '../middlewares/subirArchivos';
import { subirVerificacion, cambiarEstadoVerificacion, obtenerVerificaciones } from '../controladores/verificacionControlador';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verificarToken);

router.post(
  '/',
  subirDNI.fields([{ name: 'frente', maxCount: 1 }, { name: 'dorso', maxCount: 1 }]),
  (req, res) => void subirVerificacion(req as any, res)
);

router.put('/:id/estado', (req, res) => void cambiarEstadoVerificacion(req, res));
router.get('/', (req, res) => void obtenerVerificaciones(req, res));

export default router;

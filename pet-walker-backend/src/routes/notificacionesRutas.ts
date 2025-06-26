import { Router } from 'express';
import { verificarToken } from '../middlewares/authMiddleware';
import { obtenerNotificaciones, marcarTodasComoLeidas } from '../controladores/notificacionesControlador';

const router = Router();

router.get('/', verificarToken, obtenerNotificaciones);
router.put('/read-all', verificarToken, marcarTodasComoLeidas);

export default router; 
import { Router } from 'express';
import { obtenerFacturasPorUsuario } from '../controladores/facturasControlador';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verificarToken);
router.get('/:id', obtenerFacturasPorUsuario);

export default router;

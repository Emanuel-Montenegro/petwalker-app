import { Router } from 'express';
import { registrarPuntoGPS, obtenerPuntosGPS } from '../controladores/gpsControlador';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verificarToken);

router.post('/', (req, res) => void registrarPuntoGPS(req, res));

router.get('/:paseoId', (req, res) => void obtenerPuntosGPS(req, res));

export default router;

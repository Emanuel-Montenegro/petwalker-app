import { Router } from 'express';
import rutasUsuarios from './usuariosRutas';
import rutasAuth from './authRutas';
import rutasMascotas from './mascotasRutas';
import rutasPaseos from './paseosRutas';
import rutasCalificaciones from './calificacionesRutas';
import rutasGPS from './gpsRutas';
import certificadosRutas from './certificadosRutas';
import facturasRutas from './facturasRutas';
import healthRutas from './healthRutas';

const router = Router();

router.use('/usuarios', rutasUsuarios);
router.use('/auth', rutasAuth);
router.use('/mascotas', rutasMascotas);
router.use('/paseos', rutasPaseos);
router.use('/calificaciones', rutasCalificaciones);
router.use('/gps', rutasGPS);
router.use('/certificados', certificadosRutas);
router.use('/facturas', facturasRutas);
router.use('/health', healthRutas);
router.get('/', (_req, res) => {
  res.send('API Pet-Walker funcionando correctamente');
});

export default router;

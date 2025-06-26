import { Router, RequestHandler } from 'express';
import { subirCertificado } from '../controladores/certificadoControlador';
import { subirCertificadoMiddleware } from '../middlewares/subirCertificados';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verificarToken);

router.post(
  '/',
  subirCertificadoMiddleware.single('archivo'),
  subirCertificado as RequestHandler
);

export default router;

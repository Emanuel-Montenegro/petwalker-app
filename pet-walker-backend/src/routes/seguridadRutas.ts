import { Router, Request, Response, NextFunction } from 'express';
import { getSecurityStats, getDetailedLoginAttempts, getRevokedTokensList } from '../controladores/seguridadControlador';
import { verificarToken } from '../middlewares/authMiddleware';
import { verificarRol } from '../middlewares/rolMiddleware';
import { Rol } from '@prisma/client';
import { RequestConUsuario } from '../types/express.d';

const router = Router();

router.get(
  '/stats',
  verificarToken,
  (req: RequestConUsuario, res: Response, next: NextFunction) => verificarRol([Rol.ADMIN])(req, res, next),
  getSecurityStats
);

router.get(
  '/logs-login',
  verificarToken,
  (req: RequestConUsuario, res: Response, next: NextFunction) => verificarRol([Rol.ADMIN])(req, res, next),
  getDetailedLoginAttempts
);

router.get(
  '/revoked-tokens',
  verificarToken,
  (req: RequestConUsuario, res: Response, next: NextFunction) => verificarRol([Rol.ADMIN])(req, res, next),
  getRevokedTokensList
);

export default router;

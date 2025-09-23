import { Request, Response } from 'express';
import { authMonitor } from '../utils/authMonitor';
import { tokenManager } from '../utils/tokenManager';
import { RequestConUsuario } from '../types/express.d';

export const getSecurityStats = (req: RequestConUsuario, res: Response): void => {
  try {
    // Solo permitir acceso si el usuario es ADMIN
    if (req.usuario?.rol !== 'ADMIN') {
      res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
      return;
    }

    const loginStats = authMonitor.getStats();
    const tokenStats = tokenManager.getRevokedTokensStats();

    res.json({
      loginAttempts: loginStats,
      revokedTokens: tokenStats,
    });
  } catch (error) {

    res.status(500).json({ message: 'Error interno del servidor al obtener estadísticas de seguridad.' });
  }
};

export const getDetailedLoginAttempts = (req: RequestConUsuario, res: Response): void => {
  try {
    if (req.usuario?.rol !== 'ADMIN') {
      res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador para ver los logs detallados.' });
      return;
    }

    const detailedAttempts = authMonitor.getAllLoginAttempts();
    res.json(detailedAttempts);
  } catch (error) {

    res.status(500).json({ message: 'Error interno del servidor al obtener los logs detallados.' });
  }
};

export const getRevokedTokensList = (req: RequestConUsuario, res: Response): void => {
  try {
    if (req.usuario?.rol !== 'ADMIN') {
      res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador para ver la lista de tokens revocados.' });
      return;
    }

    const revokedTokens = tokenManager.getAllRevokedTokens();
    res.json(revokedTokens);
  } catch (error) {

    res.status(500).json({ message: 'Error interno del servidor al obtener la lista de tokens revocados.' });
  }
};

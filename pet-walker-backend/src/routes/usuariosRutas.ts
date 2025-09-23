import { Router, Request, Response } from 'express';
import { resumenUsuario, obtenerPerfil } from '../controladores/usuariosControlador';
import { verificarToken } from '../middlewares/authMiddleware';
import { RequestConUsuario } from '../types/express';
import { verificarRol } from '../middlewares/rolMiddleware';
import { Rol } from '@prisma/client';
import { prisma } from '../base_datos/conexion';

const router = Router();

router.get('/me', verificarToken, obtenerPerfil as any);

router.get('/perfil', verificarToken, (req: RequestConUsuario, res: Response) => {
  res.json({ message: 'Esta es una ruta protegida', usuario: req.usuario });
});

router.get('/:id/resumen', verificarToken, verificarRol([Rol.DUENO, Rol.PASEADOR, Rol.ADMIN]), resumenUsuario);

// Nueva ruta: obtener todos los usuarios por rol
router.get('/', verificarToken, async (req: Request, res: Response) => {
  try {
    const { rol } = req.query;
    const where: any = {};
    if (rol) where.rol = rol;
    const usuarios = await prisma.usuario.findMany({
      where,
      select: { id: true, nombre: true, email: true }
    });
    res.json({ usuarios });
  } catch (error) {

    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
});

export default router;


import { Router } from 'express';
import {
  registrarMascota,
  obtenerMisMascotas,
  editarMascota,
  eliminarMascota
} from '../controladores/mascotasControlador';
import { verificarToken } from '../middlewares/authMiddleware';
import { verificarRol } from '../middlewares/rolMiddleware';
import { Rol } from '@prisma/client';

const router = Router();

router.use(verificarToken);

router.post('/', verificarRol([Rol.DUENO, Rol.ADMIN]), registrarMascota);
router.get('/', verificarRol([Rol.DUENO, Rol.ADMIN]), obtenerMisMascotas);
router.get('/me', verificarRol([Rol.DUENO, Rol.ADMIN]), obtenerMisMascotas);

router.put('/:id', verificarRol([Rol.DUENO, Rol.ADMIN]), (req, res) => {
  void editarMascota(req, res);
});

router.delete('/:id', verificarRol([Rol.DUENO, Rol.ADMIN]), (req, res) => {
  void eliminarMascota(req, res);
});

export default router;

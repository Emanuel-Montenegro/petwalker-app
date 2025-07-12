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
import asyncHandler from 'express-async-handler';

const router = Router();

router.use(verificarToken);

router.post('/', verificarRol([Rol.DUENO, Rol.ADMIN]), asyncHandler(async (req, res) => {
  await registrarMascota(req, res);
}));
router.get('/', verificarRol([Rol.DUENO, Rol.ADMIN]), asyncHandler(async (req, res) => {
  await obtenerMisMascotas(req, res);
}));
router.get('/me', verificarRol([Rol.DUENO, Rol.ADMIN]), asyncHandler(async (req, res) => {
  await obtenerMisMascotas(req, res);
}));
router.put('/:id', verificarRol([Rol.DUENO, Rol.ADMIN]), asyncHandler(async (req, res) => {
  await editarMascota(req, res);
}));
router.delete('/:id', verificarRol([Rol.DUENO, Rol.ADMIN]), asyncHandler(async (req, res) => {
  await eliminarMascota(req, res);
}));

export default router;

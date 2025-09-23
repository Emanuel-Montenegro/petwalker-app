import { Router, Request, Response } from 'express';
import { verificarToken, RequestConUsuario } from '../middlewares/authMiddleware';
import { 
  crearPaseo, 
  obtenerPaseos, 
  aceptarPaseo, 
  obtenerMisPaseosComoDueno, 
  obtenerMisPaseosComoPaseador, 
  iniciarPaseo, 
  finalizarPaseo, 
  cancelarPaseo, 
  obtenerPaseoPorId, 
  limpiarHistorialPaseos 
} from '../controladores/paseosControlador';
import { verificarRol } from '../middlewares/rolMiddleware';
import { Rol } from '@prisma/client';
import { Server } from 'socket.io';
import { asyncHandler } from '../utils/asyncHandler';
import { validate, paseoSchema } from '../middleware/validator';

const router = Router();

// Rutas para Dueños
router.post('/', verificarToken, verificarRol([Rol.DUENO]), validate(paseoSchema.crear), asyncHandler(crearPaseo));
router.get('/mios/dueno', verificarToken, verificarRol([Rol.DUENO]), asyncHandler(obtenerMisPaseosComoDueno));

// Rutas para Paseadores
router.get('/disponibles', verificarToken, verificarRol([Rol.PASEADOR]), asyncHandler(obtenerPaseos));
router.put('/:id/aceptar', verificarToken, verificarRol([Rol.PASEADOR]), asyncHandler(aceptarPaseo));
router.put('/:id/iniciar', verificarToken, verificarRol([Rol.PASEADOR]), asyncHandler(iniciarPaseo));
router.put('/:id/finalizar', verificarToken, verificarRol([Rol.PASEADOR]), asyncHandler(finalizarPaseo));
router.get('/mios/paseador', verificarToken, verificarRol([Rol.PASEADOR]), asyncHandler(obtenerMisPaseosComoPaseador));

// Nueva ruta RESTful para obtener paseos de un paseador específico
router.get('/paseador/:paseadorId', verificarToken, verificarRol([Rol.PASEADOR]), asyncHandler(
  async (req: RequestConUsuario, res: Response) => {
    if (parseInt(req.params.paseadorId) !== req.usuario?.id) {
      res.status(403).json({ mensaje: 'No tienes permiso para ver estos paseos' });
      return;
    }
    return obtenerMisPaseosComoPaseador(req, res);
  }
));

// Ruta para obtener un paseo por id (dueño o paseador asignado)
router.get('/:id', verificarToken, obtenerPaseoPorId);

// Nueva ruta para limpiar historial
router.delete('/historial/limpiar', verificarToken, verificarRol([Rol.DUENO, Rol.PASEADOR]), async (req, res) => {
  await limpiarHistorialPaseos(req, res);
});

export default router;

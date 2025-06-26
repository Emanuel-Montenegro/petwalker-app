import { Router, Request, Response } from 'express';
import { verificarToken } from '../middlewares/authMiddleware';
import { getPaseoById } from '../controladores/paseoControlador';
import {
  crearPaseo,
  listarPaseosPendientes,
  aceptarPaseo,
  obtenerMisPaseosComoDueno,
  obtenerMisPaseosComoPaseador,
  iniciarPaseo,
  finalizarPaseo
} from '../controladores/paseosControlador';
import { verificarRol } from '../middlewares/rolMiddleware';
import { Rol } from '@prisma/client';
import { RequestConUsuario } from '../types/express.d';

const router = Router();

router.use(verificarToken);

// Función auxiliar para manejar errores asíncronos en Express
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Rutas para Dueños
router.post('/', verificarRol([Rol.DUENO]), asyncHandler(crearPaseo));
router.get('/mios/dueno', verificarRol([Rol.DUENO]), asyncHandler(obtenerMisPaseosComoDueno));

// Rutas para Paseadores
router.get('/disponibles', verificarRol([Rol.PASEADOR]), asyncHandler(listarPaseosPendientes));
router.put('/:id/aceptar', verificarRol([Rol.PASEADOR]), asyncHandler(aceptarPaseo));
router.put('/:id/iniciar', verificarRol([Rol.PASEADOR]), asyncHandler(iniciarPaseo));
router.put('/:id/finalizar', verificarRol([Rol.PASEADOR]), asyncHandler(finalizarPaseo));
router.get('/mios/paseador', verificarRol([Rol.PASEADOR]), asyncHandler(obtenerMisPaseosComoPaseador));

// Nueva ruta RESTful para obtener paseos de un paseador específico
router.get('/paseador/:paseadorId', verificarRol([Rol.PASEADOR]), asyncHandler(
  async (req: Request, res: Response) => {
    // LOGS DE DEPURACIÓN
    // @ts-ignore
    console.log('Usuario autenticado:', req.usuario);
    // @ts-ignore
    console.log('ID de la URL:', req.params.paseadorId);
    // @ts-ignore
    if (parseInt(req.params.paseadorId) !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permiso para ver estos paseos' });
    }
    // @ts-ignore
    return obtenerMisPaseosComoPaseador(req, res);
  }
));

// Ruta para obtener un paseo por id (dueño o paseador asignado)
router.get('/:id', verificarToken, asyncHandler(async (req: RequestConUsuario, res: Response) => {
  console.log('[Paseos] GET /:id - Usuario:', req.usuario);
  console.log('[Paseos] GET /:id - ID solicitado:', req.params.id);
  return getPaseoById(req, res);
}));

export default router;

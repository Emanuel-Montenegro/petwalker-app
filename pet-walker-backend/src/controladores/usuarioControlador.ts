import { Response } from 'express';
import prisma from '../lib/prisma';
import { RequestConUsuario } from '../types/express'; // Importación correcta desde types/express

// Obtener el perfil del usuario actual
export const obtenerPerfil = async (req: RequestConUsuario, res: Response): Promise<void> => {
  try {
    if (!req.usuario?.id) {
      res.status(401).json({ message: 'No autorizado' });
      return;
    }

    // El id de req.usuario.id es number según types/express.d.ts y schema.prisma
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id }, // Esto debería funcionar con id: number
      select: {
        id: true,
        nombre: true,
        email: true,
        // Según schema.prisma, telefono y direccion NO existen en Usuario. Eliminar si causan error.
        // telefono: true,
        // direccion: true,
        rol: true,
        mascotas: {
          select: {
            id: true,
            nombre: true,
            especie: true,
            raza: true,
            edad: true,
            sociable: true,
            usuarioId: true,
          }
        }
      }
    });

    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
}; 
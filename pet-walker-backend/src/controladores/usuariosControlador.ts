import { Request, Response } from 'express';
import { prisma } from '../base_datos/conexion';
import bcrypt from 'bcrypt';
import { RequestConUsuario } from '../types/express';

export async function registrarUsuario(req: Request, res: Response): Promise<void> {
  const { nombre, email, contraseña, rol } = req.body;

  try {
    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExistente) {
      res.status(400).json({ mensaje: 'El correo ya está registrado' });
      return;
    }

    const hash = await bcrypt.hash(contraseña, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        contrasena: hash,
        rol
      }
    });

    res.status(201).json({
      mensaje: 'Usuario creado',
      usuario: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {

    res.status(500).json({ mensaje: 'Error al crear el usuario' });
  }
}

export async function resumenUsuario(req: Request, res: Response): Promise<void> {
  const usuarioId = parseInt(req.params.id);

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    });

    if (!usuario) {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
      return;
    }

    const rol = usuario.rol;

    if (rol === 'PASEADOR') {
      const paseosRealizados = await prisma.paseo.count({
        where: { paseadorId: usuarioId, estado: 'FINALIZADO' }
      });

      const paseosCancelados = await prisma.paseo.count({
        where: { paseadorId: usuarioId, estado: 'CANCELADO'}
      });

      const promedio = await prisma.calificacion.aggregate({
        where: { paseadorId: usuarioId },
        _avg: { puntuacion: true }
      });

      res.json({
        usuarioId,
        rol,
        paseosRealizados,
        paseosCancelados,
        promedioCalificacion: promedio._avg.puntuacion || 0
      });
      return;
    }

    if (rol === 'DUENO') {
      const paseosSolicitados = await prisma.paseo.count({
        where: {
          mascota: { usuarioId }
        }
      });

      const paseosCancelados = await prisma.paseo.count({
        where: {
          estado: 'CANCELADO',
          mascota: { usuarioId }
        }
      });

      res.json({
        usuarioId,
        rol,
        paseosSolicitados,
        paseosCancelados
      });
      return;
    }

    res.status(400).json({ mensaje: 'Rol no válido para resumen' });
  } catch (error) {

    res.status(500).json({ mensaje: 'Error al obtener el resumen del usuario' });
  }
}

// Obtener el perfil del usuario actual (migrado desde usuarioControlador.ts)
export const obtenerPerfil = async (req: RequestConUsuario, res: Response): Promise<void> => {
  try {
    if (!req.usuario?.id) {
      res.status(401).json({ message: 'No autorizado' });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: {
        id: true,
        nombre: true,
        email: true,
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

    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};


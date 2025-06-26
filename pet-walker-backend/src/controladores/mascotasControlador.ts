import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import { RequestConUsuario } from '../types/express';
import { Rol } from '@prisma/client';
import { generarFactura } from './facturasControlador';

export const registrarMascota = async (req: RequestConUsuario, res: Response) => {
  const {
    nombre,
    especie,
    raza,
    edad,
    sociable,
    alergias,
    discapacidades,
    necesitaBozal,
    estadoVacunacion,
    observaciones,
    foto
  } = req.body;

  // Valores por defecto para los campos avanzados
  const mascotaData = {
    nombre,
    especie,
    raza,
    edad,
    sociable,
    alergias: Array.isArray(alergias) ? alergias : [],
    discapacidades: Array.isArray(discapacidades) ? discapacidades : [],
    necesitaBozal: typeof necesitaBozal === 'boolean' ? necesitaBozal : false,
    estadoVacunacion: typeof estadoVacunacion === 'string' ? estadoVacunacion : 'Desconocido',
    observaciones: typeof observaciones === 'string' ? observaciones : '',
    foto: typeof foto === 'string' ? foto : '',
    usuarioId: req.usuario!.id
  };

  try {
    const mascota = await prisma.mascota.create({
      data: mascotaData
    });

    res.status(201).json({ mensaje: 'Mascota registrada', mascota });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar la mascota' });
  }
};

export const obtenerMisMascotas = async (req: RequestConUsuario, res: Response) => {
  try {
    const mascotas = await prisma.mascota.findMany({
      where: { usuarioId: req.usuario!.id }
    });

    res.json({ mascotas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener las mascotas' });
  }
};

export const editarMascota = async (req: RequestConUsuario, res: Response) => {
  const { id } = req.params;
  const {
    nombre,
    especie,
    raza,
    edad,
    sociable,
    alergias,
    discapacidades,
    necesitaBozal,
    estadoVacunacion,
    observaciones,
    foto
  } = req.body;

  // Solo actualizar los campos enviados, pero siempre enviar los requeridos
  const mascotaData: any = {};
  if (nombre !== undefined) mascotaData.nombre = nombre;
  if (especie !== undefined) mascotaData.especie = especie;
  if (raza !== undefined) mascotaData.raza = raza;
  if (edad !== undefined) mascotaData.edad = edad;
  if (sociable !== undefined) mascotaData.sociable = sociable;
  if (alergias !== undefined) mascotaData.alergias = Array.isArray(alergias) ? alergias : [];
  if (discapacidades !== undefined) mascotaData.discapacidades = Array.isArray(discapacidades) ? discapacidades : [];
  if (necesitaBozal !== undefined) mascotaData.necesitaBozal = typeof necesitaBozal === 'boolean' ? necesitaBozal : false;
  if (estadoVacunacion !== undefined) mascotaData.estadoVacunacion = typeof estadoVacunacion === 'string' ? estadoVacunacion : 'Desconocido';
  if (observaciones !== undefined) mascotaData.observaciones = typeof observaciones === 'string' ? observaciones : '';
  if (foto !== undefined) mascotaData.foto = typeof foto === 'string' ? foto : '';

  try {
    const mascota = await prisma.mascota.updateMany({
      where: {
        id: parseInt(id),
        usuarioId: req.usuario!.id
      },
      data: mascotaData
    });

    if (mascota.count === 0) {
      return res.status(404).json({ mensaje: 'Mascota no encontrada o no autorizada' });
    }

    res.json({ mensaje: 'Mascota actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al editar la mascota' });
  }
};

export const eliminarMascota = async (req: RequestConUsuario, res: Response) => {
  const { id } = req.params;

  try {
    const resultado = await prisma.mascota.deleteMany({
      where: {
        id: parseInt(id),
        usuarioId: req.usuario!.id
      }
    });

    if (resultado.count === 0) {
      return res.status(404).json({ mensaje: 'Mascota no encontrada o no autorizada' });
    }

    res.json({ mensaje: 'Mascota eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar la mascota' });
  }
};

import { Request, Response } from 'express';
import { prisma } from '../base_datos/conexion';
import { RequestConUsuario } from '../types/express';

export const subirCertificado = async (req: RequestConUsuario, res: Response) => {
  const archivo = req.file?.filename;
  const { descripcion } = req.body;

  if (!archivo) {
    return res.status(400).json({ mensaje: 'Archivo de certificado requerido' });
  }

  try {
    const cert = await prisma.certificado.create({
      data: {
        usuarioId: req.usuario!.id,
        archivo,
        descripcion
      }
    });

    res.status(201).json({ mensaje: 'Certificado subido', cert });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al subir certificado' });
  }
};

export const listarCertificados = async (_req: RequestConUsuario, res: Response) => {
  const certificados = await prisma.certificado.findMany({
    include: { usuario: true }
  });

  res.json(certificados);
};

export const actualizarEstadoCertificado = async (req: RequestConUsuario, res: Response) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!['APROBADO', 'RECHAZADO'].includes(estado)) {
    return res.status(400).json({ mensaje: 'Estado inválido' });
  }

  try {
    const cert = await prisma.certificado.update({
      where: { id: parseInt(id) },
      data: { estado }
    });

    res.json({ mensaje: 'Estado actualizado', cert });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar estado' });
  }
};

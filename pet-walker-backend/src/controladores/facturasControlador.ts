import { Request, Response } from 'express';
import { prisma } from '../base_datos/conexion';
import { RequestConUsuario } from '../types/express';
import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

export const generarFactura = async (paseoId: number): Promise<void> => {
  const paseo = await prisma.paseo.findUnique({
    where: { id: paseoId },
    include: {
      mascota: {
        include: { usuario: true }
      },
      paseador: true
    }
  });

  if (!paseo || !paseo.mascota || !paseo.paseador) return;

  const montoFijo = 1500; 

  await prisma.factura.create({
    data: {
      paseoId: paseo.id,
      duenioId: paseo.mascota.usuarioId,
      paseadorId: paseo.paseadorId!,
      monto: montoFijo
    }
  });
};

export const obtenerFacturasPorUsuario = async (req: Request, res: Response) => {
  const { id } = req.params;
  const usuarioId = parseInt(id);

  try {
    const facturas = await prisma.factura.findMany({
      where: {
        OR: [
          { duenioId: usuarioId },
          { paseadorId: usuarioId }
        ]
      },
      orderBy: { fecha: 'desc' },
      include: {
        paseo: true,
        paseador: true,
        duenio: true
      }
    });

    res.json(facturas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener facturas' });
  }
};

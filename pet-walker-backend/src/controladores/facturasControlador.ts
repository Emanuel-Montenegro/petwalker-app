import { Request, Response } from 'express';
import { prisma } from '../base_datos/conexion';
import { RequestConUsuario } from '../types/express';
import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

export const generarFactura = async (paseoId: number): Promise<void> => {
  try {
    // Verificar si ya existe una factura para este paseo
    const facturaExistente = await prisma.factura.findUnique({
      where: { paseoId: paseoId }
    });

    if (facturaExistente) {
      console.log(`[FACTURA] Ya existe una factura para el paseo ${paseoId}`);
      return;
    }

    const paseo = await prisma.paseo.findUnique({
      where: { id: paseoId },
      include: {
        mascota: {
          include: { usuario: true }
        },
        paseador: true
      }
    });

    if (!paseo || !paseo.mascota || !paseo.paseador) {
      console.error(`[FACTURA] Datos incompletos para el paseo ${paseoId}`);
      return;
    }

    const montoFijo = 1500; 

    await prisma.factura.create({
      data: {
        paseoId: paseo.id,
        duenioId: paseo.mascota.usuarioId,
        paseadorId: paseo.paseadorId!,
        monto: montoFijo
      }
    });
    console.log(`[FACTURA] Factura generada exitosamente para el paseo ${paseoId}`);
  } catch (error) {
    console.error(`[FACTURA] Error al generar factura para el paseo ${paseoId}:`, error);
    // No relanzar el error para evitar que falle la finalización del paseo
    // throw error;
  }
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

    res.status(500).json({ mensaje: 'Error al obtener facturas' });
  }
};

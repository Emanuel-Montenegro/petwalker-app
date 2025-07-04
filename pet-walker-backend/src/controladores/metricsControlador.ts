import { Response } from 'express';
import prisma from '../lib/prisma';
import { RequestConUsuario } from '../types/express';
import { logger } from '../utils/logger';

// Métricas de negocio en tiempo real
export const getBusinessMetrics = async (req: RequestConUsuario, res: Response) => {
  try {
    // Solo admins pueden ver métricas
    if (req.usuario?.rol !== 'ADMIN') {
      return res.status(403).json({ mensaje: 'Acceso denegado' });
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);

    const semanaAtras = new Date(hoy);
    semanaAtras.setDate(semanaAtras.getDate() - 7);

    // Métricas del día
    const [
      paseosHoy,
      usuariosRegistradosHoy,
      paseosCompletadosHoy,
      ingresosTotalesHoy
    ] = await Promise.all([
      // Paseos programados hoy
      prisma.paseo.count({
        where: {
          fecha: {
            gte: hoy,
            lt: mañana
          }
        }
      }),
      
      // Nuevos usuarios hoy
      prisma.usuario.count({
        where: {
          // Asumiendo que tienes un campo createdAt
          // creadoEn: {
          //   gte: hoy,
          //   lt: mañana
          // }
        }
      }),
      
      // Paseos completados hoy
      prisma.paseo.count({
        where: {
          fecha: {
            gte: hoy,
            lt: mañana
          },
          estado: 'FINALIZADO'
        }
      }),
      
      // Ingresos del día
      prisma.paseo.aggregate({
        where: {
          fecha: {
            gte: hoy,
            lt: mañana
          },
          estado: 'FINALIZADO'
        },
        _sum: {
          precio: true
        }
      })
    ]);

    // Métricas de la semana
    const [
      paseosEstaSemana,
      paseadoresTotales,
      calificacionPromedio,
      usuariosActivos
    ] = await Promise.all([
      // Paseos esta semana
      prisma.paseo.count({
        where: {
          fecha: {
            gte: semanaAtras
          }
        }
      }),
      
      // Total paseadores
      prisma.usuario.count({
        where: {
          rol: 'PASEADOR'
        }
      }),
      
      // Calificación promedio
      prisma.calificacion.aggregate({
        _avg: {
          puntuacion: true
        }
      }),
      
      // Usuarios totales
      prisma.usuario.count()
    ]);

    // Métricas de estados de paseos
    const estadosPaseos = await prisma.paseo.groupBy({
      by: ['estado'],
      _count: {
        estado: true
      }
    });

    // Métricas por rol
    const usuariosPorRol = await prisma.usuario.groupBy({
      by: ['rol'],
      _count: {
        rol: true
      }
    });

    const metrics = {
      // Métricas del día
      today: {
        paseos_programados: paseosHoy,
        usuarios_registrados: usuariosRegistradosHoy,
        paseos_completados: paseosCompletadosHoy,
        ingresos: ingresosTotalesHoy._sum.precio || 0,
        tasa_completacion: paseosHoy > 0 ? Math.round((paseosCompletadosHoy / paseosHoy) * 100) : 0
      },
      
      // Métricas generales
      overview: {
        paseos_esta_semana: paseosEstaSemana,
        total_paseadores: paseadoresTotales,
        calificacion_promedio: calificacionPromedio._avg.puntuacion || 0,
        usuarios_totales: usuariosActivos,
        uptime: Math.round(process.uptime() / 3600) // horas
      },
      
      // Distribución de estados
      estados_paseos: estadosPaseos.reduce((acc, item) => {
        acc[item.estado] = item._count.estado;
        return acc;
      }, {} as Record<string, number>),
      
      // Distribución de usuarios
      usuarios_por_rol: usuariosPorRol.reduce((acc, item) => {
        acc[item.rol] = item._count.rol;
        return acc;
      }, {} as Record<string, number>),
      
      // Timestamp
      timestamp: new Date().toISOString(),
      generated_by: req.usuario.email
    };

    logger.info('METRICS', 'Business metrics generated', {
      admin: req.usuario.email,
      metrics_count: Object.keys(metrics).length
    });

    res.json(metrics);
  } catch (error) {
    logger.error('METRICS', 'Error generating business metrics', error);
    res.status(500).json({ mensaje: 'Error al obtener métricas' });
  }
};

// Métricas técnicas del sistema
export const getSystemMetrics = async (req: RequestConUsuario, res: Response) => {
  try {
    if (req.usuario?.rol !== 'ADMIN') {
      return res.status(403).json({ mensaje: 'Acceso denegado' });
    }

    const startTime = Date.now();
    
    // Test de conectividad de base de datos
    let dbStatus = 'connected';
    let dbResponseTime = 0;
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbResponseTime = Date.now() - dbStart;
    } catch (dbError) {
      dbStatus = 'disconnected';
      logger.error('METRICS', 'Database connectivity check failed', dbError);
    }

    // Métricas del sistema
    const systemInfo = {
      // Performance
      performance: {
        uptime_seconds: Math.round(process.uptime()),
        uptime_formatted: formatUptime(process.uptime()),
        memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        memory_total_mb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        memory_usage_percent: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
      },
      
      // Base de datos
      database: {
        status: dbStatus,
        response_time_ms: dbResponseTime,
        connection_pool: 'healthy' // Placeholder - podrías agregar métricas reales de Prisma
      },
      
      // API
      api: {
        environment: process.env.NODE_ENV || 'development',
        node_version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      
      // Timestamp
      timestamp: new Date().toISOString(),
      generation_time_ms: Date.now() - startTime
    };

    logger.info('METRICS', 'System metrics generated', {
      admin: req.usuario.email,
      db_status: dbStatus,
      response_time: dbResponseTime
    });

    res.json(systemInfo);
  } catch (error) {
    logger.error('METRICS', 'Error generating system metrics', error);
    res.status(500).json({ mensaje: 'Error al obtener métricas del sistema' });
  }
};

// Métricas de actividad reciente
export const getActivityMetrics = async (req: RequestConUsuario, res: Response) => {
  try {
    if (req.usuario?.rol !== 'ADMIN') {
      return res.status(403).json({ mensaje: 'Acceso denegado' });
    }

    const ultimasHoras = new Date();
    ultimasHoras.setHours(ultimasHoras.getHours() - 24);

    // Actividad de las últimas 24 horas
    const [
      paseosRecientes,
      notificacionesRecientes,
      calificacionesRecientes
    ] = await Promise.all([
      // Paseos recientes
      prisma.paseo.findMany({
        where: {
          creadoEn: {
            gte: ultimasHoras
          }
        },
        include: {
          mascota: {
            select: {
              nombre: true,
              usuario: {
                select: {
                  nombre: true
                }
              }
            }
          },
          paseador: {
            select: {
              nombre: true
            }
          }
        },
        orderBy: {
          creadoEn: 'desc'
        },
        take: 10
      }),
      
      // Notificaciones recientes
      prisma.notification.findMany({
        where: {
          creadaEn: {
            gte: ultimasHoras
          }
        },
        include: {
          usuario: {
            select: {
              nombre: true,
              rol: true
            }
          }
        },
        orderBy: {
          creadaEn: 'desc'
        },
        take: 10
      }),
      
      // Calificaciones recientes
      prisma.calificacion.findMany({
        where: {
          creadoEn: {
            gte: ultimasHoras
          }
        },
        include: {
          paseador: {
            select: {
              nombre: true
            }
          },
          paseo: {
            select: {
              mascota: {
                select: {
                  nombre: true
                }
              }
            }
          }
        },
        orderBy: {
          creadoEn: 'desc'
        },
        take: 10
      })
    ]);

    const activity = {
      paseos_recientes: paseosRecientes.map(paseo => ({
        id: paseo.id,
        mascota: paseo.mascota.nombre,
        dueno: paseo.mascota.usuario.nombre,
        paseador: paseo.paseador?.nombre || 'Sin asignar',
        estado: paseo.estado,
        fecha: paseo.fecha,
        precio: paseo.precio,
        creado: paseo.creadoEn
      })),
      
      notificaciones_recientes: notificacionesRecientes.map(notif => ({
        id: notif.id,
        usuario: notif.usuario.nombre,
        rol: notif.usuario.rol,
        mensaje: notif.mensaje,
        tipo: notif.tipo,
        leida: notif.leida,
        creada: notif.creadaEn
      })),
      
      calificaciones_recientes: calificacionesRecientes.map(cal => ({
        id: cal.id,
        paseador: cal.paseador.nombre,
        mascota: cal.paseo.mascota.nombre,
        puntuacion: cal.puntuacion,
        comentario: cal.comentario,
        creada: cal.creadoEn
      })),
      
      timestamp: new Date().toISOString()
    };

    res.json(activity);
  } catch (error) {
    logger.error('METRICS', 'Error generating activity metrics', error);
    res.status(500).json({ mensaje: 'Error al obtener métricas de actividad' });
  }
};

// Helper function para formatear uptime
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
} 
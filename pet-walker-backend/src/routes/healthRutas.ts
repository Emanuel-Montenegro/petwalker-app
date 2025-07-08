import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';

const router = Router();

// Health check básico
router.get('/', async (req: Request, res: Response) => {
  try {
    const healthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'checking...',
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        }
      }
    };

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthCheck.services.database = 'connected';
    } catch (dbError) {
      healthCheck.services.database = 'disconnected';
      healthCheck.status = 'degraded';
      logger.error('HEALTH', 'Database health check failed', dbError);
    }

    const statusCode = healthCheck.status === 'ok' ? 200 : 503;
    
    logger.info('HEALTH', `Health check performed`, {
      status: healthCheck.status,
      database: healthCheck.services.database
    });

    res.status(statusCode).json(healthCheck);
  } catch (error) {
    logger.error('HEALTH', 'Health check failed', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Detailed health check (para monitoreo interno)
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const detailedHealth = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
        },
        cpu: process.cpuUsage()
      },
      services: {
        database: 'checking...',
        prisma: 'checking...'
      },
      checks: [] as Array<{
        name: string;
        status: string;
        responseTime?: string;
        threshold?: string;
        error?: string;
      }>
    };

    // Database connectivity check
    try {
      const startTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      detailedHealth.services.database = 'connected';
      detailedHealth.services.prisma = 'connected';
      detailedHealth.checks.push({
        name: 'database_connectivity',
        status: 'pass',
        responseTime: `${responseTime}ms`
      });
    } catch (dbError) {
      detailedHealth.services.database = 'disconnected';
      detailedHealth.services.prisma = 'disconnected';
      detailedHealth.status = 'degraded';
      detailedHealth.checks.push({
        name: 'database_connectivity',
        status: 'fail',
        error: 'Database connection failed'
      });
    }

    // Database query performance check
    try {
      const startTime = Date.now();
      await prisma.usuario.count();
      const responseTime = Date.now() - startTime;
      
      detailedHealth.checks.push({
        name: 'database_query_performance',
        status: responseTime < 1000 ? 'pass' : 'warn',
        responseTime: `${responseTime}ms`,
        threshold: '1000ms'
      });
    } catch (queryError) {
      detailedHealth.checks.push({
        name: 'database_query_performance',
        status: 'fail',
        error: 'Database query failed'
      });
      detailedHealth.status = 'degraded';
    }

    const statusCode = detailedHealth.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(detailedHealth);
  } catch (error) {
    logger.error('HEALTH', 'Detailed health check failed', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Detailed health check failed'
    });
  }
});

// Readiness check (para Kubernetes)
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if all critical services are ready
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      reason: 'Database not available'
    });
  }
});

// Liveness check (para Kubernetes)
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router; 
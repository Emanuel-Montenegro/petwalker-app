import { VercelRequest, VercelResponse } from '@vercel/node';

// Función serverless simple para Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;
  
  try {
    // Ruta de prueba
    if (url === '/api/test' && method === 'GET') {
      return res.status(200).json({ 
        message: 'API funcionando correctamente en Vercel!',
        timestamp: new Date().toISOString()
      });
    }

    // Ruta de health check
    if (url === '/api/health' && method === 'GET') {
      return res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    }

    // Ruta básica de información
    if (url === '/api' && method === 'GET') {
      return res.status(200).json({
        name: 'Pet Walker API',
        version: '1.0.0',
        status: 'running',
        endpoints: [
          '/api/test',
          '/api/health'
        ]
      });
    }

    // Si no coincide con ninguna ruta
    return res.status(404).json({ 
      error: 'Not Found',
      message: `Route ${url} not found`,
      availableRoutes: ['/api', '/api/test', '/api/health']
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
}
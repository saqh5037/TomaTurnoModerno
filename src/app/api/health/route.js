import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    await prisma.$queryRaw`SELECT 1`;
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'toma-turno-api',
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      uptime: process.uptime(),
    };
    
    return new Response(JSON.stringify(health), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    const health = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'toma-turno-api',
      error: process.env.NODE_ENV === 'production' 
        ? 'Database connection failed' 
        : error.message,
      database: 'disconnected'
    };
    
    return new Response(JSON.stringify(health), {
      status: 503,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}
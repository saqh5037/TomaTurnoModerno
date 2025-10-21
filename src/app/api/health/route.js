import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startTime;

    // Obtener algunas métricas básicas
    const [
      totalTurns,
      pendingTurns,
      activeSessions
    ] = await Promise.all([
      prisma.turnRequest.count().catch(() => null),
      prisma.turnRequest.count({ where: { status: 'Pending' } }).catch(() => null),
      prisma.session.count({ where: { expiresAt: { gt: new Date() } } }).catch(() => null)
    ]);

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'toma-turno-api',
      version: process.env.npm_package_version || '2.6.1',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        latency: `${dbLatency}ms`
      },
      uptime: `${Math.floor(process.uptime())}s`,
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
      },
      metrics: {
        totalTurns: totalTurns,
        pendingTurns: pendingTurns,
        activeSessions: activeSessions
      }
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
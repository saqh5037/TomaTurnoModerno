import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting simple basado en IP
const rateLimit = new Map();
const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 100; // 100 requests por minuto

function getRateLimitKey(request: NextRequest): string {
  const ip = request.headers.get('x-real-ip') || 
             request.headers.get('x-forwarded-for') || 
             'unknown';
  return `${ip}:${request.nextUrl.pathname}`;
}

export function middleware(request: NextRequest) {
  // Solo aplicar rate limiting a las rutas API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const key = getRateLimitKey(request);
    const now = Date.now();
    
    // Limpiar entradas antiguas
    for (const [k, v] of rateLimit.entries()) {
      if (now - v.firstRequest > WINDOW_MS) {
        rateLimit.delete(k);
      }
    }
    
    // Verificar rate limit
    const rateLimitInfo = rateLimit.get(key);
    
    if (rateLimitInfo) {
      if (now - rateLimitInfo.firstRequest < WINDOW_MS) {
        if (rateLimitInfo.count >= MAX_REQUESTS) {
          return new NextResponse('Too Many Requests', { status: 429 });
        }
        rateLimitInfo.count++;
      } else {
        // Reiniciar ventana
        rateLimit.set(key, { firstRequest: now, count: 1 });
      }
    } else {
      rateLimit.set(key, { firstRequest: now, count: 1 });
    }
  }
  
  // Agregar headers de seguridad
  const response = NextResponse.next();
  
  // Headers de seguridad para producción
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  
  return response;
}

export const config = {
  matcher: [
    // Aplicar a todas las rutas API
    '/api/:path*',
    // Excluir archivos estáticos y _next
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
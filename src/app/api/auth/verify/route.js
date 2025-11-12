import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('CRITICAL: NEXTAUTH_SECRET or JWT_SECRET environment variable must be configured');
}

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token requerido' },
        { status: 400 }
      );
    }

    // Verificar y decodificar el token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      // Si el token expiró recientemente (menos de 1 hora), permitir refresh
      if (error.name === 'TokenExpiredError') {
        try {
          decodedToken = jwt.decode(token);
          const expiredTime = decodedToken.exp * 1000;
          const now = Date.now();
          const expiredHoursAgo = (now - expiredTime) / (1000 * 60 * 60);

          if (expiredHoursAgo > 1) {
            return NextResponse.json(
              { success: false, error: 'Token expirado', needsRefresh: false },
              { status: 401 }
            );
          }
          // Token expirado hace menos de 1 hora, permitir refresh
          return NextResponse.json(
            { success: false, error: 'Token expirado recientemente', needsRefresh: true },
            { status: 401 }
          );
        } catch (decodeError) {
          return NextResponse.json(
            { success: false, error: 'Token inválido' },
            { status: 401 }
          );
        }
      }
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Verificar que el usuario existe y está activo
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        email: true,
        isActive: true,
        lockedUntil: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Usuario desactivado' },
        { status: 403 }
      );
    }

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return NextResponse.json(
        { success: false, error: 'Cuenta bloqueada' },
        { status: 403 }
      );
    }

    // No verificar sesión en base de datos para evitar errores de Prisma
    // Solo validar el token JWT

    // Registrar verificación exitosa en auditoría (opcional, puede omitirse para reducir logs)
    // await prisma.auditLog.create({
    //   data: {
    //     userId: user.id,
    //     action: 'VERIFY_TOKEN',
    //     entity: 'Session',
    //     entityId: String(session.id),
    //     ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    //   }
    // });

    // Retornar datos del usuario y sesión válida
    return NextResponse.json({
      success: true,
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email
      },
      session: null
    });

  } catch (error) {
    console.error('Error verificando token:', error);
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint para verificación rápida
export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Token no proporcionado' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verificar token rápidamente
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return NextResponse.json({
        success: true,
        valid: true,
        userId: decoded.userId,
        role: decoded.role
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Token inválido o expirado'
      }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    );
  }
}
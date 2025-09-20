import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req) {
  try {
    const { token, refreshToken } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token requerido' },
        { status: 400 }
      );
    }

    // Decodificar el token (sin verificar expiración)
    let decodedToken;
    try {
      // Primero intentar verificar normalmente
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      // Si falló por expiración, decodificar sin verificar
      if (error.name === 'TokenExpiredError') {
        decodedToken = jwt.decode(token);

        // Verificar que no haya expirado hace más de 1 hora
        const expiredTime = decodedToken.exp * 1000;
        const now = Date.now();
        const expiredHoursAgo = (now - expiredTime) / (1000 * 60 * 60);

        if (expiredHoursAgo > 1) {
          return NextResponse.json(
            { success: false, error: 'Token expirado hace demasiado tiempo' },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'Token inválido' },
          { status: 401 }
        );
      }
    }

    if (!decodedToken || !decodedToken.userId) {
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

    // Buscar la sesión existente
    const existingSession = await prisma.session.findFirst({
      where: {
        userId: user.id,
        OR: [
          { token: token },
          { refreshToken: refreshToken }
        ]
      }
    });

    // Generar nuevo token JWT con 8 horas de expiración
    const newToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Generar nuevo refresh token
    const newRefreshToken = jwt.sign(
      {
        userId: user.id,
        type: 'refresh'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 horas

    if (existingSession) {
      // Actualizar sesión existente con nuevos tokens
      await prisma.session.update({
        where: { id: existingSession.id },
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
          expiresAt: expiresAt,
          lastActivity: new Date(),
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || existingSession.ipAddress,
          userAgent: req.headers.get('user-agent') || existingSession.userAgent
        }
      });
    } else {
      // Crear nueva sesión si no existe
      await prisma.session.create({
        data: {
          userId: user.id,
          token: newToken,
          refreshToken: newRefreshToken,
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
          expiresAt: expiresAt
        }
      });
    }

    // Registrar renovación en auditoría
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REFRESH_TOKEN',
        entity: 'Session',
        entityId: existingSession ? String(existingSession.id) : 'new',
        details: {
          oldTokenExp: decodedToken.exp,
          newTokenExp: Math.floor(expiresAt.getTime() / 1000)
        },
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      }
    });

    // Limpiar sesiones expiradas del usuario
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
        expiresAt: { lt: new Date() }
      }
    });

    return NextResponse.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email
      },
      expiresAt: expiresAt
    });

  } catch (error) {
    console.error('Error renovando token:', error);
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
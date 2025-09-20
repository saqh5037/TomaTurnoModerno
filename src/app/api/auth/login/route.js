import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Busca al usuario en la base de datos
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive'
        }
      }
    });

    if (!user) {
      // Registrar intento fallido
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Usuario desactivado. Contacte al administrador.' },
        { status: 403 }
      );
    }

    // Verificar si la cuenta está bloqueada
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return NextResponse.json(
        { error: 'Cuenta bloqueada temporalmente. Intente más tarde.' },
        { status: 403 }
      );
    }

    // Verifica la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Incrementar intentos fallidos
      const newFailedAttempts = user.failedAttempts + 1;
      const updateData = {
        failedAttempts: newFailedAttempts
      };

      // Bloquear después de 5 intentos fallidos
      if (newFailedAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });

      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Generar el token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Generar refresh token (30 días)
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        type: 'refresh'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Actualizar último login y resetear intentos fallidos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        failedAttempts: 0,
        lockedUntil: null
      }
    });

    // Crear sesión
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 horas
    await prisma.session.create({
      data: {
        userId: user.id,
        token: token,
        refreshToken: refreshToken,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        lastActivity: new Date(),
        expiresAt: expiresAt
      }
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'Session',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      }
    });

    // Retornar respuesta exitosa
    return NextResponse.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email
      },
      message: 'Login exitoso'
    }, {
      status: 200
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('CRITICAL: NEXTAUTH_SECRET or JWT_SECRET environment variable must be configured');
}

export async function PUT(req) {
  try {
    // Verificar autenticación
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decodedToken;

    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    // Obtener datos del request
    const { currentPassword, newPassword } = await req.json();

    // Validaciones básicas
    if (!currentPassword) {
      return NextResponse.json(
        { success: false, error: 'La contraseña actual es obligatoria' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 3) {
      return NextResponse.json(
        { success: false, error: 'La nueva contraseña debe tener al menos 3 caracteres' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe y obtener la contraseña actual
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
      select: {
        id: true,
        username: true,
        password: true,
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
        { success: false, error: 'Cuenta bloqueada temporalmente' },
        { status: 403 }
      );
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      // Registrar intento fallido
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'FAILED_PASSWORD_CHANGE',
            entity: 'User',
            entityId: String(user.id),
            details: JSON.stringify({ reason: 'Invalid current password' }),
            ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
          }
        });
      } catch (auditError) {
        console.warn('Error creating audit log:', auditError);
      }

      return NextResponse.json(
        { success: false, error: 'La contraseña actual es incorrecta' },
        { status: 400 }
      );
    }

    // Verificar que la nueva contraseña sea diferente
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { success: false, error: 'La nueva contraseña debe ser diferente a la actual' },
        { status: 400 }
      );
    }

    // Hashear nueva contraseña
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        passwordChangedAt: new Date(),
        // Limpiar intentos fallidos si los hay
        failedAttempts: 0,
        lockedUntil: null
      }
    });

    // Registrar cambio exitoso en auditoría
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'CHANGE_PASSWORD',
          entity: 'User',
          entityId: String(user.id),
          details: JSON.stringify({
            success: true,
            changedAt: new Date().toISOString()
          }),
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
        }
      });
    } catch (auditError) {
      console.warn('Error creating audit log:', auditError);
    }

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
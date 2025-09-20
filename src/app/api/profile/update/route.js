import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'your-secret-key';

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
    const { name, username, email, phone } = await req.json();

    // Validaciones básicas
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nombre es obligatorio' },
        { status: 400 }
      );
    }

    if (!username || !username.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nombre de usuario es obligatorio' },
        { status: 400 }
      );
    }

    // Validar formato de email si se proporciona
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'El formato del email no es válido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: decodedToken.userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el username no esté en uso por otro usuario
    if (username !== existingUser.username) {
      const usernameExists = await prisma.user.findFirst({
        where: {
          username: username,
          id: { not: decodedToken.userId }
        }
      });

      if (usernameExists) {
        return NextResponse.json(
          { success: false, error: 'El nombre de usuario ya está en uso' },
          { status: 400 }
        );
      }
    }

    // Verificar que el email no esté en uso por otro usuario (si se proporciona)
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: email,
          id: { not: decodedToken.userId }
        }
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'El email ya está en uso' },
          { status: 400 }
        );
      }
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: decodedToken.userId },
      data: {
        name: name.trim(),
        username: username.trim(),
        email: email ? email.trim() : null,
        phone: phone ? phone.trim() : null,
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        email: true,
        phone: true,
        isActive: true
      }
    });

    // Registrar en auditoría
    try {
      await prisma.auditLog.create({
        data: {
          userId: decodedToken.userId,
          action: 'UPDATE_PROFILE',
          entity: 'User',
          entityId: String(decodedToken.userId),
          details: JSON.stringify({
            updatedFields: {
              name: name !== existingUser.name,
              username: username !== existingUser.username,
              email: email !== existingUser.email,
              phone: phone !== existingUser.phone
            }
          }),
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
        }
      });
    } catch (auditError) {
      console.warn('Error creating audit log:', auditError);
      // No fallar la operación principal por error de auditoría
    }

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
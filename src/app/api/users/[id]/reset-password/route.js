import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTemporaryPassword } from "../../../../../../lib/temporaryPassword.js";

const prisma = new PrismaClient();

// POST - Generar nueva contraseña temporal
export async function POST(request, { params }) {
  try {
    const { id } = await params;

    // Verificar autorización
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decodedToken;

    try {
      decodedToken = jwt.verify(token, process.env.NEXTAUTH_SECRET || "your-secret-key");
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Token inválido" },
        { status: 401 }
      );
    }

    // Verificar que el usuario sea admin
    const requestingUser = await prisma.user.findUnique({
      where: { id: decodedToken.userId }
    });

    // Aceptar tanto 'admin' como 'Administrador' para compatibilidad
    const isAdmin = requestingUser && (
      requestingUser.role === 'Administrador' ||
      requestingUser.role === 'admin' ||
      requestingUser.role?.toLowerCase() === 'admin'
    );

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Acceso denegado. Se requieren permisos de administrador." },
        { status: 403 }
      );
    }

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Generar nueva contraseña temporal
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Actualizar usuario con nueva contraseña
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        password: hashedPassword,
        passwordChangedAt: null, // Null indica que debe cambiar la contraseña
        failedAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date()
      }
    });

    // Cerrar todas las sesiones existentes del usuario
    await prisma.session.updateMany({
      where: { userId: parseInt(id) },
      data: { expiresAt: new Date() }
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: decodedToken.userId,
        action: 'PASSWORD_RESET',
        entity: 'User',
        entityId: parseInt(id),
        newValue: {
          message: "Contraseña temporal generada",
          forUser: user.username
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      }
    });

    // Preparar respuesta
    const response = {
      success: true,
      data: {
        username: user.username,
        name: user.name,
        temporaryPassword: temporaryPassword,
        message: "Contraseña temporal generada exitosamente"
      }
    };

    // Si tiene email configurado, indicar que se podría enviar
    if (user.email) {
      response.data.emailNotification = `Se debería enviar la nueva contraseña a: ${user.email}`;
      response.data.emailNote = "Nota: El envío de email no está configurado en este entorno";
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error al resetear contraseña:", error);
    return NextResponse.json(
      { success: false, error: "Error al resetear contraseña" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
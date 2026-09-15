import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { checkAdminPermission } from "../../utils/checkAdmin.js";

const prisma = new PrismaClient();

// POST - Desbloquear cuenta bloqueada por intentos fallidos de login
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

    const adminCheck = checkAdminPermission(requestingUser);
    if (!adminCheck.success) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        name: true,
        failedAttempts: true,
        lockedUntil: true
      }
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: decodedToken.userId,
        action: 'USER_UNLOCKED',
        entity: 'User',
        entityId: parseInt(id),
        oldValue: {
          failedAttempts: currentUser.failedAttempts,
          lockedUntil: currentUser.lockedUntil
        },
        newValue: {
          failedAttempts: 0,
          lockedUntil: null
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Cuenta desbloqueada exitosamente"
    });

  } catch (error) {
    console.error("Error al desbloquear usuario:", error);
    return NextResponse.json(
      { success: false, error: "Error al desbloquear usuario" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

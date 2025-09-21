import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// PATCH - Activar/desactivar usuario
export async function PATCH(request, { params }) {
  try {
    const { id } = params;

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

    if (!requestingUser || requestingUser.role !== 'Administrador') {
      return NextResponse.json(
        { success: false, error: "Acceso denegado. Se requieren permisos de administrador." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: "Se requiere el campo isActive (boolean)" },
        { status: 400 }
      );
    }

    // Prevenir auto-desactivación
    if (decodedToken.userId === parseInt(id) && !isActive) {
      return NextResponse.json(
        { success: false, error: "No puedes desactivar tu propia cuenta" },
        { status: 400 }
      );
    }

    // Obtener usuario actual
    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Si se está desactivando un admin, verificar que no sea el último
    if (currentUser.role === 'Administrador' && !isActive) {
      const adminCount = await prisma.user.count({
        where: { role: 'admin', isActive: true }
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, error: "No se puede desactivar el último administrador" },
          { status: 400 }
        );
      }
    }

    // Actualizar estado
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        isActive,
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    // Si se desactiva, cerrar todas las sesiones
    if (!isActive) {
      await prisma.session.updateMany({
        where: { userId: parseInt(id) },
        data: { expiresAt: new Date() }
      });
    }

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: decodedToken.userId,
        action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
        entity: 'User',
        entityId: parseInt(id),
        oldValue: { isActive: currentUser.isActive },
        newValue: { isActive },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: isActive ? "Usuario activado exitosamente" : "Usuario desactivado exitosamente"
    });

  } catch (error) {
    console.error("Error al cambiar estado del usuario:", error);
    return NextResponse.json(
      { success: false, error: "Error al cambiar estado del usuario" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
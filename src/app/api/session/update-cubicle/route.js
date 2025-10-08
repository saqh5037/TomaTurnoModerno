import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// POST - Actualizar cubículo seleccionado en la sesión activa
export async function POST(request) {
  try {
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

    const body = await request.json();
    const { cubicleId } = body;

    // Validar que se proporcionó cubicleId
    if (!cubicleId) {
      return NextResponse.json(
        { success: false, error: "cubicleId es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el cubículo existe y está activo
    const cubicle = await prisma.cubicle.findFirst({
      where: {
        id: parseInt(cubicleId),
        isActive: true
      }
    });

    if (!cubicle) {
      return NextResponse.json(
        { success: false, error: "Cubículo no válido o inactivo" },
        { status: 400 }
      );
    }

    // Actualizar la sesión actual del usuario
    const session = await prisma.session.findFirst({
      where: {
        token: token,
        userId: decodedToken.userId,
        expiresAt: { gt: new Date() }
      }
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Sesión no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar el cubículo seleccionado en la sesión
    await prisma.session.update({
      where: { id: session.id },
      data: {
        selectedCubicleId: parseInt(cubicleId),
        lastActivity: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Cubículo actualizado en la sesión",
      cubicleId: parseInt(cubicleId),
      cubicleName: cubicle.name
    });

  } catch (error) {
    console.error("Error al actualizar cubículo en sesión:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar cubículo" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

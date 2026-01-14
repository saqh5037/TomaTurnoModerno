import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('CRITICAL: NEXTAUTH_SECRET or JWT_SECRET environment variable must be configured');
}

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
      decodedToken = jwt.verify(token, JWT_SECRET);
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

    // VALIDACIÓN DE RACE CONDITION: Verificar que el cubículo no está ocupado por otro usuario
    const existingOccupation = await prisma.session.findFirst({
      where: {
        selectedCubicleId: parseInt(cubicleId),
        expiresAt: { gt: new Date() },
        userId: { not: decodedToken.userId }, // Excluir al usuario actual
        user: { role: { not: 'Admin' } } // Solo contar flebotomistas (no admins)
      },
      include: {
        user: { select: { name: true } }
      }
    });

    if (existingOccupation) {
      return NextResponse.json({
        success: false,
        error: `El cubículo ya fue tomado por ${existingOccupation.user.name}`,
        code: "CUBICLE_ALREADY_TAKEN"
      }, { status: 409 }); // 409 Conflict
    }

    // Usar transacción para garantizar atomicidad y evitar race conditions
    try {
      await prisma.$transaction(async (tx) => {
        // Double-check dentro de la transacción
        const stillOccupied = await tx.session.findFirst({
          where: {
            selectedCubicleId: parseInt(cubicleId),
            expiresAt: { gt: new Date() },
            userId: { not: decodedToken.userId },
            user: { role: { not: 'Admin' } }
          }
        });

        if (stillOccupied) {
          throw new Error("CUBICLE_TAKEN");
        }

        // Actualizar el cubículo seleccionado en la sesión
        await tx.session.update({
          where: { id: session.id },
          data: {
            selectedCubicleId: parseInt(cubicleId),
            lastActivity: new Date()
          }
        });
      });
    } catch (txError) {
      if (txError.message === "CUBICLE_TAKEN") {
        return NextResponse.json({
          success: false,
          error: "El cubículo fue tomado por otro usuario",
          code: "CUBICLE_ALREADY_TAKEN"
        }, { status: 409 });
      }
      throw txError;
    }

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
  }
}

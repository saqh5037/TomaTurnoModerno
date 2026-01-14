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

    // PREVENCIÓN DE RACE CONDITION usando transacción con isolation level SERIALIZABLE
    // Esto garantiza que solo una transacción pueda leer y modificar el cubículo a la vez
    const cubicleIdInt = parseInt(cubicleId);
    const sessionIdInt = session.id;
    const userIdInt = decodedToken.userId;

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Usar SELECT FOR UPDATE para bloquear las filas relevantes
        // Esto evita que otra transacción lea hasta que esta termine
        const occupiedSessions = await tx.$queryRaw`
          SELECT s.id, u.name as "userName"
          FROM "Session" s
          INNER JOIN "User" u ON s."userId" = u.id
          WHERE s."selectedCubicleId" = ${cubicleIdInt}
            AND s."expiresAt" > NOW()
            AND s."userId" != ${userIdInt}
            AND u.role != 'Admin'
          FOR UPDATE
        `;

        if (occupiedSessions && occupiedSessions.length > 0) {
          // El cubículo está ocupado por otro usuario
          return {
            success: false,
            occupiedBy: occupiedSessions[0].userName
          };
        }

        // El cubículo está disponible, asignarlo
        await tx.session.update({
          where: { id: sessionIdInt },
          data: {
            selectedCubicleId: cubicleIdInt,
            lastActivity: new Date()
          }
        });

        return { success: true };
      }, {
        isolationLevel: 'Serializable', // Máximo nivel de aislamiento
        timeout: 10000 // 10 segundos de timeout
      });

      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: `El cubículo ya fue tomado por ${result.occupiedBy}`,
          code: "CUBICLE_ALREADY_TAKEN"
        }, { status: 409 });
      }
    } catch (txError) {
      // Manejar errores de serialización (cuando dos transacciones compiten)
      if (txError.code === 'P2034' || txError.message?.includes('could not serialize')) {
        // Error de serialización - el cubículo fue tomado por otro
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

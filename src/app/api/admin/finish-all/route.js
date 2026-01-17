import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

// POST - Finalizar todos los turnos activos de un solo golpe
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

    // Verificar rol (solo admin y supervisor)
    const userRole = decodedToken.role?.toLowerCase();
    if (!['admin', 'administrador', 'supervisor'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Acceso denegado" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Se requiere una razón (mínimo 5 caracteres)" },
        { status: 400 }
      );
    }

    // Obtener todos los turnos activos antes de actualizarlos (para auditoría)
    const activeTurns = await prisma.turnRequest.findMany({
      where: {
        status: { in: ['Pending', 'In Progress'] }
      },
      select: {
        id: true,
        assignedTurn: true,
        patientName: true,
        status: true
      }
    });

    if (activeTurns.length === 0) {
      return NextResponse.json(
        { success: false, error: "No hay turnos activos para finalizar" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Actualizar todos los turnos activos en batch
    const result = await prisma.turnRequest.updateMany({
      where: {
        status: { in: ['Pending', 'In Progress'] }
      },
      data: {
        status: 'Attended',
        finishedAt: now,
        isCalled: true,
        // Limpiar holding si existe
        holdingBy: null,
        holdingAt: null
      }
    });

    // Registrar en auditoría (una entrada para toda la operación batch)
    await prisma.auditLog.create({
      data: {
        userId: decodedToken.userId,
        action: "ADMIN_FINISH_ALL",
        entity: "TurnRequest",
        entityId: null, // Es una operación batch, no hay un solo entityId
        oldValue: {
          count: activeTurns.length,
          turnIds: activeTurns.map(t => t.id),
          turns: activeTurns.map(t => ({
            id: t.id,
            assignedTurn: t.assignedTurn,
            patientName: t.patientName,
            status: t.status
          }))
        },
        newValue: {
          status: "Attended",
          finishedAt: now,
          reason: reason.trim(),
          finishedCount: result.count
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    });

    console.log(`[Admin] Finalización masiva: ${result.count} turnos finalizados por ${decodedToken.name || decodedToken.userId}. Razón: ${reason}`);

    return NextResponse.json({
      success: true,
      message: `${result.count} turnos finalizados exitosamente`,
      data: {
        finishedCount: result.count,
        reason: reason.trim(),
        finishedAt: now
      }
    });

  } catch (error) {
    console.error("[Admin Finish All] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al finalizar turnos" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

// POST - Reactivar un turno finalizado (volverlo a Pending)
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
    const { turnId, reason } = body;

    if (!turnId) {
      return NextResponse.json(
        { success: false, error: "turnId es requerido" },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Se requiere una razón (mínimo 5 caracteres)" },
        { status: 400 }
      );
    }

    // Obtener el turno actual
    const turn = await prisma.turnRequest.findUnique({
      where: { id: parseInt(turnId) },
      include: {
        user: { select: { id: true, name: true } },
        cubicle: { select: { id: true, name: true } }
      }
    });

    if (!turn) {
      return NextResponse.json(
        { success: false, error: "Turno no encontrado" },
        { status: 404 }
      );
    }

    // Solo se pueden reactivar turnos finalizados (Attended)
    if (turn.status !== 'Attended') {
      return NextResponse.json(
        { success: false, error: "Solo se pueden reactivar turnos finalizados" },
        { status: 400 }
      );
    }

    // Verificar que sea del día actual (no reactivar turnos viejos)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (turn.finishedAt && turn.finishedAt < today) {
      return NextResponse.json(
        { success: false, error: "No se pueden reactivar turnos de días anteriores" },
        { status: 400 }
      );
    }

    // Guardar datos anteriores para auditoría
    const oldValue = {
      status: turn.status,
      attendedBy: turn.attendedBy,
      cubicleId: turn.cubicleId,
      finishedAt: turn.finishedAt,
      attendedAt: turn.attendedAt
    };

    // Reactivar el turno (volver a Pending)
    const updatedTurn = await prisma.turnRequest.update({
      where: { id: parseInt(turnId) },
      data: {
        status: "Pending",
        finishedAt: null,
        attendedBy: null,
        attendedAt: null,
        cubicleId: null,
        isCalled: false,
        calledAt: null,
        callCount: 0,
        // Limpiar holding también
        holdingBy: null,
        holdingAt: null
      }
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: decodedToken.userId,
        action: "ADMIN_REACTIVATE_TURN",
        entity: "TurnRequest",
        entityId: turn.id,
        oldValue: oldValue,
        newValue: {
          status: "Pending",
          reason: reason.trim()
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    });

    console.log(`[Admin] Turno reactivado: ${turn.assignedTurn} por ${decodedToken.name || decodedToken.userId}. Razón: ${reason}`);

    return NextResponse.json({
      success: true,
      message: `Turno ${turn.assignedTurn} reactivado exitosamente`,
      data: {
        turnId: turn.id,
        assignedTurn: turn.assignedTurn,
        patientName: turn.patientName,
        previousStatus: oldValue.status,
        newStatus: "Pending",
        reason: reason.trim()
      }
    });

  } catch (error) {
    console.error("[Admin Reactivate Turn] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al reactivar turno" },
      { status: 500 }
    );
  }
}

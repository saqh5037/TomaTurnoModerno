import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

// POST - Cancelar un turno
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
        holdingUser: { select: { id: true, name: true } },
        cubicle: { select: { id: true, name: true } }
      }
    });

    if (!turn) {
      return NextResponse.json(
        { success: false, error: "Turno no encontrado" },
        { status: 404 }
      );
    }

    if (turn.status === 'Cancelled') {
      return NextResponse.json(
        { success: false, error: "El turno ya está cancelado" },
        { status: 400 }
      );
    }

    if (turn.status === 'Attended') {
      return NextResponse.json(
        { success: false, error: "No se puede cancelar un turno ya finalizado" },
        { status: 400 }
      );
    }

    // Guardar datos anteriores para auditoría
    const oldValue = {
      status: turn.status,
      attendedBy: turn.attendedBy,
      attendedByName: turn.user?.name,
      holdingBy: turn.holdingBy,
      holdingByName: turn.holdingUser?.name,
      cubicleId: turn.cubicleId,
      cubicleName: turn.cubicle?.name,
      isCalled: turn.isCalled
    };

    const now = new Date();

    // Cancelar turno (mantener historial)
    const updatedTurn = await prisma.turnRequest.update({
      where: { id: parseInt(turnId) },
      data: {
        status: "Cancelled",
        // Limpiar asignaciones
        holdingBy: null,
        holdingAt: null,
        attendedBy: null,
        cubicleId: null,
        isCalled: false,
        // Registrar momento de cancelación
        finishedAt: now
      }
    });

    // Registrar en auditoría con razón
    await prisma.auditLog.create({
      data: {
        userId: decodedToken.userId,
        action: "ADMIN_CANCEL_TURN",
        entity: "TurnRequest",
        entityId: turn.id,
        oldValue: oldValue,
        newValue: {
          status: "Cancelled",
          reason: reason.trim(),
          cancelledAt: now
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    });

    console.log(`[Admin] Turno cancelado: ${turn.assignedTurn} por ${decodedToken.name || decodedToken.userId}. Razón: ${reason}`);

    return NextResponse.json({
      success: true,
      message: `Turno ${turn.assignedTurn} cancelado`,
      data: {
        turnId: turn.id,
        assignedTurn: turn.assignedTurn,
        patientName: turn.patientName,
        previousStatus: oldValue.status,
        reason: reason.trim()
      }
    });

  } catch (error) {
    console.error("[Admin Cancel Turn] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al cancelar turno" },
      { status: 500 }
    );
  }
}

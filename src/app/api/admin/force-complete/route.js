import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

// POST - Forzar finalización de un turno
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

    if (turn.status === 'Attended') {
      return NextResponse.json(
        { success: false, error: "El turno ya está finalizado" },
        { status: 400 }
      );
    }

    if (turn.status === 'Cancelled') {
      return NextResponse.json(
        { success: false, error: "El turno está cancelado" },
        { status: 400 }
      );
    }

    // Guardar datos anteriores para auditoría
    const oldValue = {
      status: turn.status,
      attendedBy: turn.attendedBy,
      cubicleId: turn.cubicleId,
      holdingBy: turn.holdingBy,
      finishedAt: turn.finishedAt
    };

    const now = new Date();

    // Forzar finalización
    const updatedTurn = await prisma.turnRequest.update({
      where: { id: parseInt(turnId) },
      data: {
        status: "Attended",
        finishedAt: now,
        isCalled: true,
        // Limpiar holding si existe
        holdingBy: null,
        holdingAt: null
      }
    });

    // Registrar en auditoría con razón
    await prisma.auditLog.create({
      data: {
        userId: decodedToken.userId,
        action: "ADMIN_FORCE_COMPLETE",
        entity: "TurnRequest",
        entityId: turn.id,
        oldValue: oldValue,
        newValue: {
          status: "Attended",
          finishedAt: now,
          reason: reason.trim()
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    });

    console.log(`[Admin] Turno forzado a finalizado: ${turn.assignedTurn} por ${decodedToken.name || decodedToken.userId}. Razón: ${reason}`);

    return NextResponse.json({
      success: true,
      message: `Turno ${turn.assignedTurn} marcado como finalizado`,
      data: {
        turnId: turn.id,
        assignedTurn: turn.assignedTurn,
        patientName: turn.patientName,
        previousStatus: oldValue.status,
        newStatus: "Attended",
        reason: reason.trim()
      }
    });

  } catch (error) {
    console.error("[Admin Force Complete] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al forzar finalización" },
      { status: 500 }
    );
  }
}

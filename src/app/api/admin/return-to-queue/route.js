import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

// POST - Regresar turno a cola (In Progress → Pending)
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

    if (turn.status !== 'In Progress') {
      return NextResponse.json(
        { success: false, error: `El turno debe estar en 'In Progress' para regresarlo a cola. Estado actual: ${turn.status}` },
        { status: 400 }
      );
    }

    // Guardar datos anteriores para auditoría
    const oldValue = {
      status: turn.status,
      attendedBy: turn.attendedBy,
      attendedByName: turn.user?.name,
      cubicleId: turn.cubicleId,
      cubicleName: turn.cubicle?.name,
      isCalled: turn.isCalled,
      calledAt: turn.calledAt,
      attendedAt: turn.attendedAt
    };

    // Regresar a cola
    const updatedTurn = await prisma.turnRequest.update({
      where: { id: parseInt(turnId) },
      data: {
        status: "Pending",
        attendedBy: null,
        cubicleId: null,
        isCalled: false,
        calledAt: null,
        attendedAt: null,
        // Mantener holdingBy/holdingAt si existían (no debería en In Progress)
        holdingBy: null,
        holdingAt: null
      }
    });

    // Registrar en auditoría con razón
    await prisma.auditLog.create({
      data: {
        userId: decodedToken.userId,
        action: "ADMIN_RETURN_TO_QUEUE",
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

    console.log(`[Admin] Turno regresado a cola: ${turn.assignedTurn} por ${decodedToken.name || decodedToken.userId}. Razón: ${reason}`);

    return NextResponse.json({
      success: true,
      message: `Turno ${turn.assignedTurn} regresado a cola`,
      data: {
        turnId: turn.id,
        assignedTurn: turn.assignedTurn,
        patientName: turn.patientName,
        previousStatus: "In Progress",
        previousPhlebotomist: oldValue.attendedByName,
        previousCubicle: oldValue.cubicleName,
        reason: reason.trim()
      }
    });

  } catch (error) {
    console.error("[Admin Return to Queue] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al regresar turno a cola" },
      { status: 500 }
    );
  }
}

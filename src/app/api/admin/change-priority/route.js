import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

// POST - Cambiar prioridad de un turno (General <-> Special)
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
    const { turnId, newPriority } = body;

    if (!turnId) {
      return NextResponse.json(
        { success: false, error: "turnId es requerido" },
        { status: 400 }
      );
    }

    if (!newPriority || !['General', 'Special'].includes(newPriority)) {
      return NextResponse.json(
        { success: false, error: "newPriority debe ser 'General' o 'Special'" },
        { status: 400 }
      );
    }

    // Obtener el turno actual
    const turn = await prisma.turnRequest.findUnique({
      where: { id: parseInt(turnId) }
    });

    if (!turn) {
      return NextResponse.json(
        { success: false, error: "Turno no encontrado" },
        { status: 404 }
      );
    }

    if (!['Pending', 'In Progress'].includes(turn.status)) {
      return NextResponse.json(
        { success: false, error: "Solo se puede cambiar prioridad de turnos Pending o In Progress" },
        { status: 400 }
      );
    }

    if (turn.tipoAtencion === newPriority) {
      return NextResponse.json(
        { success: false, error: `El turno ya tiene prioridad ${newPriority}` },
        { status: 400 }
      );
    }

    // Guardar datos anteriores para auditoría
    const oldValue = {
      tipoAtencion: turn.tipoAtencion
    };

    // Cambiar prioridad
    const updatedTurn = await prisma.turnRequest.update({
      where: { id: parseInt(turnId) },
      data: {
        tipoAtencion: newPriority
      }
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: decodedToken.userId,
        action: "ADMIN_CHANGE_PRIORITY",
        entity: "TurnRequest",
        entityId: turn.id,
        oldValue: oldValue,
        newValue: { tipoAtencion: newPriority },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    });

    console.log(`[Admin] Prioridad cambiada: Turno ${turn.assignedTurn} de ${oldValue.tipoAtencion} a ${newPriority} por ${decodedToken.name || decodedToken.userId}`);

    return NextResponse.json({
      success: true,
      message: `Turno ${turn.assignedTurn} cambiado a ${newPriority}`,
      data: {
        turnId: turn.id,
        assignedTurn: turn.assignedTurn,
        patientName: turn.patientName,
        previousPriority: oldValue.tipoAtencion,
        newPriority: newPriority
      }
    });

  } catch (error) {
    console.error("[Admin Change Priority] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al cambiar prioridad" },
      { status: 500 }
    );
  }
}

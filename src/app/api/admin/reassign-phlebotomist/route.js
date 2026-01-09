import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

// POST - Reasignar flebotomista a un turno
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
    const { turnId, phlebotomistId } = body;

    if (!turnId) {
      return NextResponse.json(
        { success: false, error: "turnId es requerido" },
        { status: 400 }
      );
    }

    if (!phlebotomistId) {
      return NextResponse.json(
        { success: false, error: "phlebotomistId es requerido" },
        { status: 400 }
      );
    }

    // Obtener el turno actual
    const turn = await prisma.turnRequest.findUnique({
      where: { id: parseInt(turnId) },
      include: {
        user: { select: { id: true, name: true } }
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
        { success: false, error: "Solo se puede reasignar flebotomista a turnos en progreso" },
        { status: 400 }
      );
    }

    // Verificar que el flebotomista existe y está activo
    const newPhlebotomist = await prisma.user.findUnique({
      where: { id: parseInt(phlebotomistId) }
    });

    if (!newPhlebotomist) {
      return NextResponse.json(
        { success: false, error: "Flebotomista no encontrado" },
        { status: 404 }
      );
    }

    if (!newPhlebotomist.isActive) {
      return NextResponse.json(
        { success: false, error: "El flebotomista está inactivo" },
        { status: 400 }
      );
    }

    const newRole = newPhlebotomist.role?.toLowerCase();
    if (!['flebotomista'].includes(newRole)) {
      return NextResponse.json(
        { success: false, error: "El usuario seleccionado no es flebotomista" },
        { status: 400 }
      );
    }

    // Guardar datos anteriores para auditoría
    const oldValue = {
      attendedBy: turn.attendedBy,
      attendedByName: turn.user?.name
    };

    // Reasignar flebotomista
    const updatedTurn = await prisma.turnRequest.update({
      where: { id: parseInt(turnId) },
      data: {
        attendedBy: parseInt(phlebotomistId)
      }
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: decodedToken.userId,
        action: "ADMIN_REASSIGN_PHLEBOTOMIST",
        entity: "TurnRequest",
        entityId: turn.id,
        oldValue: oldValue,
        newValue: {
          attendedBy: parseInt(phlebotomistId),
          attendedByName: newPhlebotomist.name
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    });

    console.log(`[Admin] Flebotomista reasignado: Turno ${turn.assignedTurn} de ${oldValue.attendedByName || 'ninguno'} a ${newPhlebotomist.name}`);

    return NextResponse.json({
      success: true,
      message: `Flebotomista reasignado para turno ${turn.assignedTurn}`,
      data: {
        turnId: turn.id,
        assignedTurn: turn.assignedTurn,
        patientName: turn.patientName,
        previousPhlebotomist: oldValue.attendedByName,
        newPhlebotomist: newPhlebotomist.name
      }
    });

  } catch (error) {
    console.error("[Admin Reassign Phlebotomist] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al reasignar flebotomista" },
      { status: 500 }
    );
  }
}

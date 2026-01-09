import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

// POST - Reasignar cubículo a un turno
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
    const { turnId, cubicleId } = body;

    if (!turnId) {
      return NextResponse.json(
        { success: false, error: "turnId es requerido" },
        { status: 400 }
      );
    }

    if (!cubicleId) {
      return NextResponse.json(
        { success: false, error: "cubicleId es requerido" },
        { status: 400 }
      );
    }

    // Obtener el turno actual
    const turn = await prisma.turnRequest.findUnique({
      where: { id: parseInt(turnId) },
      include: {
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
        { success: false, error: "Solo se puede reasignar cubículo a turnos en progreso" },
        { status: 400 }
      );
    }

    // Verificar que el cubículo existe y está activo
    const newCubicle = await prisma.cubicle.findUnique({
      where: { id: parseInt(cubicleId) }
    });

    if (!newCubicle) {
      return NextResponse.json(
        { success: false, error: "Cubículo no encontrado" },
        { status: 404 }
      );
    }

    if (!newCubicle.isActive) {
      return NextResponse.json(
        { success: false, error: "El cubículo está inactivo" },
        { status: 400 }
      );
    }

    // Guardar datos anteriores para auditoría
    const oldValue = {
      cubicleId: turn.cubicleId,
      cubicleName: turn.cubicle?.name
    };

    // Reasignar cubículo
    const updatedTurn = await prisma.turnRequest.update({
      where: { id: parseInt(turnId) },
      data: {
        cubicleId: parseInt(cubicleId)
      }
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: decodedToken.userId,
        action: "ADMIN_REASSIGN_CUBICLE",
        entity: "TurnRequest",
        entityId: turn.id,
        oldValue: oldValue,
        newValue: {
          cubicleId: parseInt(cubicleId),
          cubicleName: newCubicle.name
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    });

    console.log(`[Admin] Cubículo reasignado: Turno ${turn.assignedTurn} de ${oldValue.cubicleName || 'ninguno'} a ${newCubicle.name}`);

    return NextResponse.json({
      success: true,
      message: `Cubículo reasignado para turno ${turn.assignedTurn}`,
      data: {
        turnId: turn.id,
        assignedTurn: turn.assignedTurn,
        patientName: turn.patientName,
        previousCubicle: oldValue.cubicleName,
        newCubicle: newCubicle.name
      }
    });

  } catch (error) {
    console.error("[Admin Reassign Cubicle] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al reasignar cubículo" },
      { status: 500 }
    );
  }
}

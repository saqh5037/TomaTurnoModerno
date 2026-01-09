import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

// POST - Liberar holding de un turno
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
    const { turnId } = body;

    if (!turnId) {
      return NextResponse.json(
        { success: false, error: "turnId es requerido" },
        { status: 400 }
      );
    }

    // Obtener el turno actual
    const turn = await prisma.turnRequest.findUnique({
      where: { id: parseInt(turnId) },
      include: {
        holdingUser: { select: { id: true, name: true } }
      }
    });

    if (!turn) {
      return NextResponse.json(
        { success: false, error: "Turno no encontrado" },
        { status: 404 }
      );
    }

    if (!turn.holdingBy) {
      return NextResponse.json(
        { success: false, error: "El turno no está en holding" },
        { status: 400 }
      );
    }

    // Guardar datos anteriores para auditoría
    const oldValue = {
      holdingBy: turn.holdingBy,
      holdingAt: turn.holdingAt,
      holdingUserName: turn.holdingUser?.name
    };

    // Liberar el holding
    const updatedTurn = await prisma.turnRequest.update({
      where: { id: parseInt(turnId) },
      data: {
        holdingBy: null,
        holdingAt: null
      }
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: decodedToken.userId,
        action: "ADMIN_RELEASE_HOLDING",
        entity: "TurnRequest",
        entityId: turn.id,
        oldValue: oldValue,
        newValue: { holdingBy: null, holdingAt: null },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    });

    console.log(`[Admin] Holding liberado: Turno ${turn.assignedTurn} por usuario ${decodedToken.name || decodedToken.userId}`);

    return NextResponse.json({
      success: true,
      message: `Holding liberado para turno ${turn.assignedTurn}`,
      data: {
        turnId: turn.id,
        assignedTurn: turn.assignedTurn,
        previousHolder: oldValue.holdingUserName
      }
    });

  } catch (error) {
    console.error("[Admin Release Holding] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al liberar holding" },
      { status: 500 }
    );
  }
}

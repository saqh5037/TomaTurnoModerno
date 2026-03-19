import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

/**
 * POST /api/admin/assign-patient
 * Admin asigna manualmente un paciente a un flebotomista.
 * El paciente queda en holding para ese flebotomista.
 * Al detectarlo, el flebotomista recibe notificación y al aceptar se hace el llamado.
 *
 * Body: { turnId: number, phlebotomistId: number }
 */
export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ success: false, error: "Token inválido" }, { status: 401 });
    }

    const userRole = decoded.role?.toLowerCase();
    if (!['admin', 'administrador', 'supervisor'].includes(userRole)) {
      return NextResponse.json({ success: false, error: "Acceso denegado" }, { status: 403 });
    }

    const { turnId, phlebotomistId } = await request.json();

    if (!turnId || !phlebotomistId) {
      return NextResponse.json(
        { success: false, error: "Se requiere turnId y phlebotomistId" },
        { status: 400 }
      );
    }

    const turnIdNum = parseInt(turnId);
    const phlebIdNum = parseInt(phlebotomistId);

    // Verificar que el turno existe y está Pending
    const turn = await prisma.turnRequest.findUnique({
      where: { id: turnIdNum }
    });

    if (!turn) {
      return NextResponse.json({ success: false, error: "Turno no encontrado" }, { status: 404 });
    }

    if (turn.status !== 'Pending') {
      return NextResponse.json(
        { success: false, error: `Turno no está pendiente (status: ${turn.status})` },
        { status: 400 }
      );
    }

    // Verificar que el flebotomista existe
    const phlebotomist = await prisma.user.findUnique({
      where: { id: phlebIdNum },
      select: { id: true, name: true }
    });

    if (!phlebotomist) {
      return NextResponse.json({ success: false, error: "Flebotomista no encontrado" }, { status: 404 });
    }

    // Liberar holding anterior si existe
    if (turn.holdingBy) {
      console.log(`[assign-patient] Liberando holding anterior de usuario ${turn.holdingBy}`);
    }

    // Asignar el turno en holding al flebotomista designado
    // Usamos holdingBy + un flag especial para que el frontend sepa que fue asignación admin
    const updatedTurn = await prisma.turnRequest.update({
      where: { id: turnIdNum },
      data: {
        holdingBy: phlebIdNum,
        holdingAt: new Date(),
        // Guardar en observations que fue asignación admin
        observations: turn.observations
          ? `${turn.observations} | ASIGNADO POR ADMIN: ${decoded.name || decoded.userId} a ${phlebotomist.name}`
          : `ASIGNADO POR ADMIN: ${decoded.name || decoded.userId} a ${phlebotomist.name}`
      }
    });

    // Crear audit log
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        action: 'ADMIN_ASSIGN_PATIENT',
        entity: 'TurnRequest',
        entityId: String(turnIdNum),
        oldValue: { holdingBy: turn.holdingBy, status: turn.status },
        newValue: {
          holdingBy: phlebIdNum,
          phlebotomistName: phlebotomist.name,
          assignedBy: decoded.name || decoded.userId
        }
      }
    });

    console.log(`[assign-patient] Turno ${turnIdNum} (${turn.patientName}) asignado a ${phlebotomist.name} por admin ${decoded.name}`);

    return NextResponse.json({
      success: true,
      message: `Paciente ${turn.patientName} asignado a ${phlebotomist.name}`,
      turn: updatedTurn,
      phlebotomist
    });

  } catch (error) {
    console.error("[assign-patient] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

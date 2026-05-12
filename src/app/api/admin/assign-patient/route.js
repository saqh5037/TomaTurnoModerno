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

    // Detectar tipo de operación: nueva asignación, re-asignación, o no-op
    let opType = 'NEW_ASSIGNMENT';
    let reassignNote = '';
    if (turn.holdingBy && turn.holdingBy !== phlebIdNum) {
      opType = 'REASSIGNMENT';
      const prevPhleb = await prisma.user.findUnique({
        where: { id: turn.holdingBy },
        select: { name: true }
      });
      reassignNote = ` | RE-ASIGNADO desde ${prevPhleb?.name || `usuario ${turn.holdingBy}`}`;
      console.log(`[assign-patient] Re-asignando turno ${turnIdNum} de usuario ${turn.holdingBy} a ${phlebIdNum}`);
    } else if (turn.holdingBy === phlebIdNum) {
      opType = 'NOOP_ALREADY_ASSIGNED';
      console.log(`[assign-patient] Turno ${turnIdNum} ya estaba asignado a ${phlebotomist.name}, refrescando holdingAt`);
    }

    // Asignar el turno en holding al flebotomista designado
    // forcedAssign=true → assignNextHolding NUNCA hace swap por prioridad ni libera por timeout
    const baseAssignNote = `ASIGNADO POR ADMIN: ${decoded.name || decoded.userId} a ${phlebotomist.name}${reassignNote}`;
    const updatedTurn = await prisma.turnRequest.update({
      where: { id: turnIdNum },
      data: {
        holdingBy: phlebIdNum,
        holdingAt: new Date(),
        forcedAssign: true,
        observations: turn.observations
          ? `${turn.observations} | ${baseAssignNote}`
          : baseAssignNote
      }
    });

    // Calcular posición FIFO en la cola del flebo destino (1-indexed)
    const queue = await prisma.turnRequest.findMany({
      where: { status: 'Pending', holdingBy: phlebIdNum },
      orderBy: { holdingAt: 'asc' },
      select: { id: true }
    });
    const queuePosition = queue.findIndex(t => t.id === turnIdNum) + 1;
    const queueSize = queue.length;

    // Crear audit log
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        action: 'ADMIN_ASSIGN_PATIENT',
        entity: 'TurnRequest',
        entityId: turnIdNum,
        oldValue: { holdingBy: turn.holdingBy, status: turn.status },
        newValue: {
          holdingBy: phlebIdNum,
          phlebotomistName: phlebotomist.name,
          assignedBy: decoded.name || decoded.userId,
          opType,
          queuePosition,
          queueSize
        }
      }
    });

    console.log(`[assign-patient] Turno ${turnIdNum} (${turn.patientName}) asignado a ${phlebotomist.name} por admin ${decoded.name} — posición ${queuePosition}/${queueSize}`);

    const positionLabel = queueSize > 1
      ? ` (posición ${queuePosition} de ${queueSize} en cola)`
      : '';
    return NextResponse.json({
      success: true,
      message: `Paciente ${turn.patientName} asignado a ${phlebotomist.name}${positionLabel}`,
      turn: updatedTurn,
      phlebotomist,
      queuePosition,
      queueSize,
      opType
    });

  } catch (error) {
    console.error("[assign-patient] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

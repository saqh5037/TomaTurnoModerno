import prisma from '../../../../../lib/prisma.js';

/**
 * POST /api/queue/defer
 * Marca un turno como diferido (regresa a la cola de espera)
 * Solo disponible para pacientes con callCount >= 2
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { turnId } = body;

    if (!turnId) {
      return new Response(
        JSON.stringify({ error: "El ID del turno es requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtener el turno actual
    const turn = await prisma.turnRequest.findUnique({
      where: { id: parseInt(turnId) },
      select: {
        id: true,
        callCount: true,
        status: true,
        patientName: true,
        tipoAtencion: true,  // Para filtrar por tipo al calcular deferredAt
        createdAt: true
      }
    });

    if (!turn) {
      return new Response(
        JSON.stringify({ error: "Turno no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validar que el turno esté en progreso
    if (turn.status !== 'In Progress') {
      return new Response(
        JSON.stringify({
          error: `El turno debe estar en progreso para diferir la toma. Estado actual: ${turn.status}`
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Calcular deferredAt: va 5 posiciones atrás dentro de su grupo (Special o General)
    // Si hay menos de 5 pacientes del mismo tipo, va al final del grupo
    const POSITIONS_BACK = 5;

    // Obtener los turnos pendientes del mismo tipo, ordenados por posición en cola
    const pendingTurns = await prisma.$queryRaw`
      SELECT id, COALESCE("deferredAt", "createdAt") as effective_time
      FROM "TurnRequest"
      WHERE status = 'Pending'
        AND "tipoAtencion" = ${turn.tipoAtencion}
        AND id != ${turn.id}
      ORDER BY COALESCE("deferredAt", "createdAt") ASC
    `;

    let deferredAt;
    let newPosition;

    if (pendingTurns.length >= POSITIONS_BACK) {
      // Hay suficientes pacientes: ir 5 posiciones atrás
      // Índice 4 = 5ta posición desde el frente, queremos insertarnos DESPUÉS de ella
      const targetIndex = POSITIONS_BACK - 1;
      const targetTurn = pendingTurns[targetIndex];
      const targetTime = new Date(targetTurn.effective_time).getTime();

      // Insertar justo después del target (1ms después)
      deferredAt = new Date(targetTime + 1);
      newPosition = POSITIONS_BACK + 1;
    } else {
      // Menos de 5 pacientes: ir al final del grupo
      const lastTurn = pendingTurns[pendingTurns.length - 1];
      const baseTime = lastTurn?.effective_time || turn.createdAt;
      deferredAt = new Date(new Date(baseTime).getTime() + 1000);
      newPosition = pendingTurns.length + 1;
    }

    console.log(`[Defer] ${turn.patientName} → posición ${newPosition} (${pendingTurns.length} pendientes del tipo ${turn.tipoAtencion})`);

    // Actualizar el turno a estado diferido
    const now = new Date();
    const updatedTurn = await prisma.turnRequest.update({
      where: { id: parseInt(turnId) },
      data: {
        status: "Pending",          // Regresa a estado pendiente
        isDeferred: true,            // Marca como diferido
        deferredAt: deferredAt,      // Timestamp que asegura que va al final de la cola
        isCalled: false,             // Reset bandera de llamado
        attendedBy: null,            // Quita asignación de flebotomista
        cubicleId: null,             // Quita asignación de cubículo
        updatedAt: now
      },
      include: {
        cubicle: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log(`✅ Turno ${turnId} (${turn.patientName}) marcado como diferido - Llamados: ${turn.callCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Turno marcado como diferido y regresado a la cola",
        turn: updatedTurn
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error al diferir turno:", error);
    return new Response(
      JSON.stringify({
        error: "Error al procesar la solicitud",
        details: error.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

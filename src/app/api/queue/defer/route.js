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

    // Calcular deferredAt: debe ser DESPUÉS del último paciente pendiente DEL MISMO TIPO
    // para que se vaya al final de su grupo (Special o General)
    const maxTimeResult = await prisma.$queryRaw`
      SELECT MAX(COALESCE("deferredAt", "createdAt")) as max_time
      FROM "TurnRequest"
      WHERE status = 'Pending' AND "tipoAtencion" = ${turn.tipoAtencion}
    `;

    // Si hay pacientes pendientes del mismo tipo, defer después del último
    // Si no hay, usar el createdAt del propio paciente
    const baseTime = maxTimeResult[0]?.max_time || turn.createdAt;
    const deferredAt = new Date(new Date(baseTime).getTime() + 1000); // +1 segundo

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

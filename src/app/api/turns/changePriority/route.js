import prisma from '@/lib/prisma';

/**
 * PUT /api/turns/changePriority
 * Cambia el tipo de atención de un paciente (Special <-> General)
 * Solo disponible para supervisores y administradores
 */
export async function PUT(req) {
  try {
    const body = await req.json();
    const { turnId, newPriority } = body;

    if (!turnId || !newPriority) {
      return new Response(
        JSON.stringify({ error: "Se requiere turnId y newPriority" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validar que newPriority sea válido
    if (newPriority !== "Special" && newPriority !== "General") {
      return new Response(
        JSON.stringify({ error: "newPriority debe ser 'Special' o 'General'" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtener el turno actual
    const turn = await prisma.turnRequest.findUnique({
      where: { id: parseInt(turnId) },
      select: {
        id: true,
        patientName: true,
        assignedTurn: true,
        tipoAtencion: true,
        status: true
      }
    });

    if (!turn) {
      return new Response(
        JSON.stringify({ error: "Turno no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Actualizar el tipo de atención
    const updatedTurn = await prisma.turnRequest.update({
      where: { id: parseInt(turnId) },
      data: {
        tipoAtencion: newPriority,
        updatedAt: new Date()
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

    console.log(
      `✅ Prioridad cambiada - Paciente #${turn.assignedTurn} (${turn.patientName}): ` +
      `${turn.tipoAtencion} → ${newPriority}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: `Prioridad cambiada a ${newPriority === "Special" ? "Especial" : "General"}`,
        turn: updatedTurn,
        previousPriority: turn.tipoAtencion,
        newPriority: newPriority
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error al cambiar prioridad:", error);
    return new Response(
      JSON.stringify({
        error: "Error al procesar la solicitud",
        details: error.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

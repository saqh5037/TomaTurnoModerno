import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { turnId, userId, cubicleId } = await req.json();

    if (!turnId || !userId || !cubicleId) {
      return new Response(
        JSON.stringify({ error: "Faltan parámetros: turnId, userId o cubicleId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verificar que el turno existe y su estado actual
    const turn = await prisma.turnRequest.findUnique({
      where: { id: turnId },
      select: {
        id: true,
        status: true,
        holdingBy: true,
        patientName: true,
      },
    });

    if (!turn) {
      return new Response(
        JSON.stringify({ error: "Turno no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (turn.status !== "Pending") {
      return new Response(
        JSON.stringify({ error: "El turno no está en estado Pending" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verificar que el turno está en holding del usuario o no está en holding
    if (turn.holdingBy && turn.holdingBy !== userId) {
      return new Response(
        JSON.stringify({
          error: "Este turno está reservado por otro flebotomista",
          holdingBy: turn.holdingBy,
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Actualizar el turno: Pending/Holding → In Progress
    const updatedTurn = await prisma.turnRequest.update({
      where: { id: turnId },
      data: {
        status: "In Progress",
        isCalled: false,
        attendedBy: userId,
        cubicleId: parseInt(cubicleId, 10),
        calledAt: new Date(),
        // Limpiar campos de holding al pasar a In Progress
        holdingBy: null,
        holdingAt: null,
        // También limpiar campos de sugerencia (deprecated)
        suggestedFor: null,
        suggestedAt: null,
      },
    });

    console.log(`[call] Turno ${turnId} (${turn.patientName}) llamado por usuario ${userId} en cubículo ${cubicleId}`);

    return new Response(JSON.stringify(updatedTurn), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al llamar al paciente:", error);
    return new Response(
      JSON.stringify({ error: "Error al llamar al paciente" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

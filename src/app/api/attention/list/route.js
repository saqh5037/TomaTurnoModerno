import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    // Consulta para turnos pendientes
    const pendingTurns = await prisma.turnRequest.findMany({
      where: { status: "Pending" },
      select: {
        id: true,
        patientName: true,
        assignedTurn: true,
        tipoAtencion: true,
      },
    });

    // Consulta para turnos en progreso
    const inProgressTurns = await prisma.turnRequest.findMany({
      where: { status: "In Progress" },
      select: {
        id: true,
        patientName: true,
        assignedTurn: true,
        tipoAtencion: true,
        isCalled: true,
        cubicle: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Respuesta con los datos
    return new Response(
      JSON.stringify({
        pendingTurns: pendingTurns.map((turn) => ({
          id: turn.id,
          patientName: turn.patientName,
          assignedTurn: turn.assignedTurn,
          isSpecial: turn.tipoAtencion === "Special",
        })),
        inProgressTurns: inProgressTurns.map((turn) => ({
          id: turn.id,
          patientName: turn.patientName,
          assignedTurn: turn.assignedTurn,
          isSpecial: turn.tipoAtencion === "Special",
          isCalled: turn.isCalled,
          cubicleName: turn.cubicle?.name || "Sin cubículo",
          flebotomistName: turn.user?.name || "Sin flebotomista",
        })),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en /api/attention/list:", error);

    // Manejo de errores
    return new Response(
      JSON.stringify({ error: "Error al obtener los turnos" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

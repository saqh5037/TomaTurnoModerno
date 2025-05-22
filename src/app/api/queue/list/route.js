import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    // Pacientes en Espera
    const pendingTurns = await prisma.turnRequest.findMany({
      where: { status: "Pending" },
      select: {
        id: true,
        patientName: true,
        assignedTurn: true,
      },
    });

    // Pacientes en Llamado
    const inCallingTurns = await prisma.turnRequest.findMany({
      where: { status: "In Progress", isCalled: false },
      select: {
        id: true,
        patientName: true,
        assignedTurn: true,
        cubicle: {
          select: {
            name: true,
          },
        },
      },
    });

    // Pacientes en Atención
    const inProgressTurns = await prisma.turnRequest.findMany({
      where: { status: "In Progress", isCalled: true },
      select: {
        id: true,
        patientName: true,
        assignedTurn: true,
        cubicle: {
          select: {
            name: true,
          },
        },
      },
    });

    return new Response(
      JSON.stringify({ pendingTurns, inCallingTurns, inProgressTurns }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error en /api/queue/list:", error);
    return new Response(JSON.stringify({ error: "Error al obtener los turnos" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log("Iniciando consulta de turnos en la API");

    const pendingTurns = await prisma.turnRequest.findMany({
      where: { status: "Pending" },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        patientName: true,
        gender: true,
        studies: true,
        tipoAtencion: true,
        cubicleId: true,
        cubicle: {
          select: {
            name: true,
            type: true,
            isSpecial: true
          }
        },
        user: { select: { name: true } },
        isCalled: true
      },
    }) || [];

    const inProgressTurns = await prisma.turnRequest.findMany({
      where: { status: "In Progress" },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        patientName: true,
        gender: true,
        studies: true,
        tipoAtencion: true,
        cubicleId: true,
        cubicle: {
          select: {
            name: true,
            type: true,
            isSpecial: true
          }
        },
        user: { select: { name: true } },
        isCalled: true
      },
    }) || [];

    // Validación de los datos
    if (!Array.isArray(pendingTurns) || !Array.isArray(inProgressTurns)) {
      throw new Error("Datos de turnos no son válidos");
    }

    console.log("Consulta de turnos completada:", { pendingTurns, inProgressTurns });

    return new Response(
      JSON.stringify({ pendingTurns, inProgressTurns }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al obtener la cola de turnos:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener la cola de turnos", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Endpoint para actualizar el estado de isCalled a true
export async function POST(req) {
  try {
    const { turnId, isCalled } = await req.json();

    // Validación para asegurar que los valores no sean null o undefined
    if (typeof turnId !== 'number' || typeof isCalled !== 'boolean') {
      return new Response(
        JSON.stringify({ error: "Faltan parámetros: turnId o isCalled no son válidos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const updatedTurn = await prisma.turnRequest.update({
      where: { id: turnId },
      data: { isCalled }
    });

    return new Response(
      JSON.stringify(updatedTurn),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al actualizar el estado:", error);
    return new Response(
      JSON.stringify({ error: "No se pudo actualizar el estado" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


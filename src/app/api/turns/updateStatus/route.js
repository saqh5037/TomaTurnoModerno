import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { turnId, isCalled } = await req.json();

    console.log("Datos recibidos en updateCallStatus:", { turnId, isCalled });

    if (!turnId || typeof isCalled !== "boolean") {
      return new Response(
        JSON.stringify({ error: "Parámetros faltantes o inválidos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const updatedTurn = await prisma.turnRequest.update({
      where: { id: turnId },
      data: { isCalled },
    });

    console.log("Estado del llamado actualizado:", updatedTurn);

    return new Response(
      JSON.stringify({ success: true, updatedTurn }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en updateCallStatus:", error);
    return new Response(
      JSON.stringify({ error: "Error al actualizar el estado del llamado" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
export async function GET(req) {
  try {
    const pendingTurns = await prisma.turnRequest.findMany({
      where: { status: 'Pending' },
    });

    const callingTurn = await prisma.turnRequest.findFirst({
      where: { status: 'In Progress', isCalled: false },
    });

    const inProgressTurns = await prisma.turnRequest.findMany({
      where: { status: 'In Progress', isCalled: true },
    });

    return new Response(
      JSON.stringify({ pendingTurns, callingTurn, inProgressTurns }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error al obtener los turnos:', error);
    return new Response(
      JSON.stringify({ error: 'Error al obtener los turnos' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
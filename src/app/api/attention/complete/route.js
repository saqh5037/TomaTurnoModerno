import prisma from "@/lib/prisma";
import { assignNextHolding } from "@/lib/holdingUtils";

export async function POST(req) {
  try {
    const { turnId, userId } = await req.json();

    if (!turnId) {
      return new Response(
        JSON.stringify({ error: "turnId es requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtener el turno actual para verificar el attendedBy
    const currentTurn = await prisma.turnRequest.findUnique({
      where: { id: turnId },
      select: {
        id: true,
        attendedBy: true,
        patientName: true,
      },
    });

    if (!currentTurn) {
      return new Response(
        JSON.stringify({ error: "Turno no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Actualizar el turno a Attended
    const updatedTurn = await prisma.turnRequest.update({
      where: { id: turnId },
      data: {
        status: "Attended",
        isCalled: true,
        finishedAt: new Date(),
      },
    });

    console.log(`[complete] Turno ${turnId} (${currentTurn.patientName}) finalizado`);

    // Asignar automáticamente el siguiente turno en holding
    // Usar el userId del body o el attendedBy del turno finalizado
    const attendingUserId = userId || currentTurn.attendedBy;
    let nextTurn = null;

    if (attendingUserId) {
      nextTurn = await assignNextHolding(attendingUserId);
      if (nextTurn) {
        console.log(`[complete] Siguiente turno ${nextTurn.id} asignado en holding al usuario ${attendingUserId}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        completedTurn: updatedTurn,
        nextHoldingTurn: nextTurn,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al finalizar la atención:", error);
    return new Response(
      JSON.stringify({ error: "Error al finalizar la atención" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

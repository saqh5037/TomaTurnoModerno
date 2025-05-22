import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { turnId } = await req.json();

    const updatedTurn = await prisma.turnRequest.update({
      where: { id: turnId },
      data: {
        status: "Attended", // Cambia el estado a "Atendido"
        isCalled: true, // Marca como llamado
        finishedAt: new Date(), // Registra la fecha y hora de finalización
      },
    });

    return new Response(JSON.stringify(updatedTurn), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al finalizar la atención:", error);
    return new Response(JSON.stringify({ error: "Error al finalizar la atención" }), { status: 500 });
  }
}

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

    const updatedTurn = await prisma.turnRequest.update({
      where: { id: turnId },
      data: { status: "In Progress", isCalled: false, attendedBy: userId, cubicleId: parseInt(cubicleId, 10) },
    });

    return new Response(JSON.stringify(updatedTurn), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al llamar al paciente:", error);
    return new Response(JSON.stringify({ error: "Error al llamar al paciente" }), { status: 500 });
  }
}

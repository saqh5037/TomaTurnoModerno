import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { turnId } = await req.json();
    if (!turnId) {
      return new Response(
        JSON.stringify({ error: "El ID del turno es requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const updatedTurn = await prisma.turnRequest.update({
      where: { id: turnId },
      data: { status: "In Progress", isCalled: false },
    });

    return new Response(
      JSON.stringify(updatedTurn),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error calling turn:", error);
    return new Response(
      JSON.stringify({ error: "Error calling turn" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { turnId } = await req.json();

    const updatedTurn = await prisma.turnRequest.update({
      where: { id: turnId },
      data: { isCalled: false },
    });

    return new Response(JSON.stringify(updatedTurn), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al repetir el llamado:", error);
    return new Response(JSON.stringify({ error: "Error al repetir el llamado" }), { status: 500 });
  }
}

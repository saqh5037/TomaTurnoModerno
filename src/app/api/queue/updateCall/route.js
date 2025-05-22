import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, isCalled } = body;

    if (!id || typeof isCalled !== "boolean") {
      return new Response(
        JSON.stringify({ error: "Faltan datos o el formato es incorrecto" }),
        { status: 400 }
      );
    }

    // Actualiza el turno en la base de datos
    const updatedTurn = await prisma.turnRequest.update({
      where: { id: parseInt(id) },
      data: { isCalled },
    });

    return new Response(JSON.stringify(updatedTurn), { status: 200 });
  } catch (error) {
    console.error("Error al actualizar el estado de llamado:", error);
    return new Response(
      JSON.stringify({ error: "Error al actualizar el turno" }),
      { status: 500 }
    );
  }
}

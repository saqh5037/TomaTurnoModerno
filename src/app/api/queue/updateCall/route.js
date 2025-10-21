import prisma from '../../../../../lib/prisma.js';

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

    // Si se está llamando al paciente (isCalled = true), incrementar contador
    const updateData = { isCalled };

    if (isCalled) {
      // Obtener el turno actual para incrementar el contador
      const currentTurn = await prisma.turnRequest.findUnique({
        where: { id: parseInt(id) },
        select: { callCount: true }
      });

      updateData.callCount = (currentTurn?.callCount || 0) + 1;
      updateData.calledAt = new Date();
    }

    // Actualiza el turno en la base de datos
    const updatedTurn = await prisma.turnRequest.update({
      where: { id: parseInt(id) },
      data: updateData,
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

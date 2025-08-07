// src/app/api/queue_video/updateCall/route.js
import prisma from '../../../../../lib/prisma.js';

export async function PUT(req) {
  try {
    const { id, isCalled } = await req.json(); // isCalled debe ser un booleano

    if (!id || typeof isCalled !== 'boolean') {
      console.error("PUT /api/queue_video/updateCall: ID de turno o estado de llamado inválido. Recibido:", { id, isCalled });
      return new Response(JSON.stringify({ error: "ID de turno o estado de llamado inválido." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updatedTurn = await prisma.turnRequest.update({
      where: { id: id },
      data: {
        isCalled: isCalled,
        // Si isCalled se establece a true, actualizamos also calledAt
        // Si isCalled se establece a false, reseteamos calledAt a null para el próximo llamado
        calledAt: isCalled ? (new Date()) : null,
      },
    });

    console.log(`PUT /api/queue_video/updateCall: Turno ${id} actualizado a isCalled: ${isCalled}.`);
    return new Response(JSON.stringify(updatedTurn), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error al actualizar el estado de llamado del turno para video screen:", error);
    return new Response(JSON.stringify({ error: "Error al actualizar el estado del turno." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
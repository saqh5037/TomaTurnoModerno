import prisma from "@/lib/prisma";

/**
 * POST /api/queue/skipHolding
 * Salta el turno actual en holding y asigna el siguiente disponible
 *
 * Body: { userId: number, currentTurnId: number }
 * Response: { success: boolean, skippedTurn: object, nextTurn: object }
 */
export async function POST(request) {
  try {
    const { userId, currentTurnId } = await request.json();

    if (!userId) {
      return Response.json(
        { success: false, error: "userId es requerido" },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId, 10);

    // Usar transacción para evitar race conditions
    const result = await prisma.$transaction(async (tx) => {
      // 1. Liberar el turno actual del holding (si existe)
      let skippedTurn = null;
      if (currentTurnId) {
        skippedTurn = await tx.turnRequest.findFirst({
          where: {
            id: parseInt(currentTurnId, 10),
            holdingBy: userIdNum,
            status: "Pending",
          },
        });

        if (skippedTurn) {
          await tx.turnRequest.update({
            where: { id: skippedTurn.id },
            data: {
              holdingBy: null,
              holdingAt: null,
            },
          });
          console.log(`[skipHolding] Turno ${skippedTurn.id} liberado de holding`);
        }
      }

      // 2. Buscar el siguiente turno disponible (excluyendo el que acabamos de saltar)
      const nextTurn = await tx.turnRequest.findFirst({
        where: {
          status: "Pending",
          holdingBy: null,
          ...(currentTurnId ? { id: { not: parseInt(currentTurnId, 10) } } : {}),
        },
        orderBy: [
          { tipoAtencion: "desc" }, // Special primero
          { isDeferred: "asc" }, // No diferidos primero
          { deferredAt: "asc" },
          { createdAt: "asc" },
        ],
      });

      if (!nextTurn) {
        // No hay más turnos disponibles, volver al turno saltado
        if (skippedTurn) {
          const reassigned = await tx.turnRequest.update({
            where: { id: skippedTurn.id },
            data: {
              holdingBy: userIdNum,
              holdingAt: new Date(),
            },
          });
          console.log(`[skipHolding] No hay más turnos, volviendo a ${skippedTurn.id}`);
          return {
            skippedTurn: null,
            nextTurn: reassigned,
            cycleCompleted: true,
          };
        }
        return {
          skippedTurn: null,
          nextTurn: null,
          cycleCompleted: false,
        };
      }

      // 3. Asignar el siguiente turno en holding
      const assignedTurn = await tx.turnRequest.update({
        where: {
          id: nextTurn.id,
          holdingBy: null, // Verificación adicional para evitar race condition
        },
        data: {
          holdingBy: userIdNum,
          holdingAt: new Date(),
        },
        include: {
          cubicle: true,
        },
      });

      console.log(`[skipHolding] Nuevo turno ${assignedTurn.id} asignado en holding al usuario ${userIdNum}`);

      return {
        skippedTurn,
        nextTurn: assignedTurn,
        cycleCompleted: false,
      };
    });

    return Response.json({
      success: true,
      skippedTurn: result.skippedTurn,
      nextTurn: result.nextTurn,
      cycleCompleted: result.cycleCompleted,
      message: result.cycleCompleted
        ? "No hay más pacientes, volviendo al anterior"
        : result.nextTurn
          ? "Siguiente paciente asignado"
          : "No hay pacientes disponibles",
    });

  } catch (error) {
    console.error("[skipHolding] Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

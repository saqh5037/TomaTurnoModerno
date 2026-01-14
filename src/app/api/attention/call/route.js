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

    const turnIdInt = parseInt(turnId);
    const userIdInt = parseInt(userId);
    const cubicleIdInt = parseInt(cubicleId);

    // PREVENCIÓN DE RACE CONDITION usando transacción con isolation level SERIALIZABLE
    // Esto garantiza que solo una transacción pueda leer y modificar el turno a la vez
    try {
      const result = await prisma.$transaction(async (tx) => {
        // SELECT FOR UPDATE bloquea la fila para otras transacciones
        // Esto evita que otra transacción lea hasta que esta termine
        const turns = await tx.$queryRaw`
          SELECT id, status, "holdingBy", "patientName"
          FROM "TurnRequest"
          WHERE id = ${turnIdInt}
          FOR UPDATE
        `;

        if (!turns || turns.length === 0) {
          return { success: false, error: "Turno no encontrado", status: 404 };
        }

        const turn = turns[0];

        // Verificar estado DENTRO de la transacción (con el candado activo)
        if (turn.status !== "Pending") {
          return {
            success: false,
            error: `El turno ya está en estado: ${turn.status}`,
            code: "TURN_NOT_PENDING",
            status: 400
          };
        }

        // Verificar holding DENTRO de la transacción
        if (turn.holdingBy && turn.holdingBy !== userIdInt) {
          return {
            success: false,
            error: "Este turno está reservado por otro flebotomista",
            code: "TURN_HELD_BY_OTHER",
            status: 403
          };
        }

        // Actualizar - nadie más puede modificar porque tenemos el lock
        const updatedTurn = await tx.turnRequest.update({
          where: { id: turnIdInt },
          data: {
            status: "In Progress",
            isCalled: false,
            attendedBy: userIdInt,
            cubicleId: cubicleIdInt,
            calledAt: new Date(),
            // Limpiar campos de holding al pasar a In Progress
            holdingBy: null,
            holdingAt: null,
            // También limpiar campos de sugerencia (deprecated)
            suggestedFor: null,
            suggestedAt: null,
          },
        });

        console.log(`[call] Turno ${turnIdInt} (${turn.patientName}) llamado por usuario ${userIdInt} en cubículo ${cubicleIdInt}`);

        return { success: true, turn: updatedTurn };
      }, {
        isolationLevel: 'Serializable', // Máximo nivel de aislamiento
        timeout: 10000 // 10 segundos de timeout
      });

      if (!result.success) {
        return new Response(
          JSON.stringify({ error: result.error, code: result.code }),
          { status: result.status, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify(result.turn), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    } catch (txError) {
      // Manejar errores de serialización (cuando dos transacciones compiten)
      if (txError.code === 'P2034' || txError.message?.includes('could not serialize')) {
        // Error de serialización - el turno fue tomado por otro
        console.log(`[call] Race condition detectada para turno ${turnIdInt} - otro usuario lo tomó primero`);
        return new Response(
          JSON.stringify({
            error: "El turno fue tomado por otro usuario",
            code: "TURN_ALREADY_TAKEN"
          }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
      throw txError;
    }

  } catch (error) {
    console.error("Error al llamar al paciente:", error);
    return new Response(
      JSON.stringify({ error: "Error al llamar al paciente" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

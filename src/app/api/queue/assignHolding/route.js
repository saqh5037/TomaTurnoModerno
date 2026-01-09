import { assignNextHolding, getUserHoldingTurn } from "@/lib/holdingUtils";

/**
 * POST /api/queue/assignHolding
 * Asigna el siguiente turno disponible en holding a un flebotomista
 *
 * Body: { userId: number }
 * Response: { success: boolean, turn: TurnRequest | null, message: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return Response.json(
        { success: false, error: "userId es requerido" },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId, 10);

    // Intentar asignar siguiente turno (la función verifica si ya tiene uno)
    const turn = await assignNextHolding(userIdNum);

    if (turn) {
      return Response.json({
        success: true,
        turn,
        message: turn.holdingBy === userIdNum && turn.holdingAt
          ? "Turno asignado en holding"
          : "Turno ya estaba en holding",
      });
    }

    // Si no hay turno, verificar por qué
    return Response.json({
      success: true,
      turn: null,
      message: "No hay turnos disponibles o ya tiene un paciente en atención",
    });

  } catch (error) {
    console.error("[assignHolding] Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/queue/assignHolding
 * Obtiene el turno actualmente en holding para un usuario
 *
 * Query: ?userId=number
 * Response: { success: boolean, turn: TurnRequest | null }
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json(
        { success: false, error: "userId es requerido" },
        { status: 400 }
      );
    }

    const turn = await getUserHoldingTurn(parseInt(userId, 10));

    return Response.json({
      success: true,
      turn,
    });

  } catch (error) {
    console.error("[assignHolding GET] Error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

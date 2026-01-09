import { releaseUserHoldings } from "@/lib/holdingUtils";

/**
 * POST /api/queue/releaseHolding
 * Libera todos los turnos en holding de un usuario
 * Usado cuando el usuario sale de la página o hace logout
 *
 * Soporta tanto JSON body como sendBeacon (que envía text/plain)
 *
 * Body: { userId: number }
 * Response: { success: boolean, released: number }
 */
export async function POST(request) {
  try {
    let userId;

    // Intentar parsear el body como JSON
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      userId = body.userId;
    } else {
      // sendBeacon puede enviar como text/plain
      const text = await request.text();
      try {
        const parsed = JSON.parse(text);
        userId = parsed.userId;
      } catch {
        // Si no es JSON válido, intentar como query string o número directo
        userId = parseInt(text, 10) || null;
      }
    }

    if (!userId) {
      // Para sendBeacon, no necesitamos respuesta detallada
      return new Response(null, { status: 204 });
    }

    const userIdNum = parseInt(userId, 10);
    const released = await releaseUserHoldings(userIdNum);

    // Si viene de sendBeacon, responder sin body
    if (!contentType.includes("application/json")) {
      return new Response(null, { status: 204 });
    }

    return Response.json({
      success: true,
      released,
      message: released > 0
        ? `Se liberaron ${released} turno(s) en holding`
        : "No había turnos en holding para liberar",
    });

  } catch (error) {
    console.error("[releaseHolding] Error:", error);

    // Para sendBeacon, siempre responder OK para evitar errores en consola
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return new Response(null, { status: 204 });
    }

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

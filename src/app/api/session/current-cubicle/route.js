import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "CRITICAL: NEXTAUTH_SECRET or JWT_SECRET environment variable must be configured"
  );
}

/**
 * GET /api/session/current-cubicle
 *
 * Devuelve el cubicleId que la BD tiene asignado a la sesión del usuario
 * autenticado actualmente. Sin side effects, solo lectura.
 *
 * Existe para que pages/turns/attention.js pueda usar la BD como fuente
 * de verdad en lugar de confiar en localStorage (que puede estar
 * contaminado con valores de sesiones previas del mismo navegador).
 *
 * Respuesta:
 *   200 { success: true, cubicleId: number|null }
 *   401 { success: false, error: "No autorizado" }
 *   404 { success: false, error: "Sesión no encontrada" }
 */
export async function GET(request) {
  try {
    // Verificar JWT
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Token inválido" },
        { status: 401 }
      );
    }

    // Buscar la sesión actual del usuario (por token + userId + no expirada)
    const session = await prisma.session.findFirst({
      where: {
        token: token,
        userId: decodedToken.userId,
        expiresAt: { gt: new Date() },
      },
      select: {
        selectedCubicleId: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Sesión no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      cubicleId: session.selectedCubicleId ?? null,
    });
  } catch (error) {
    console.error("[current-cubicle] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";
import { releaseUserHoldings } from "@/lib/holdingUtils";

// POST - Cerrar sesión y limpiar datos de sesión
export async function POST(request) {
  try {
    // Verificar autorización
    const authHeader = request.headers.get("authorization");

    // Si no hay token, considerar logout exitoso (ya deslogueado)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({
        success: true,
        message: "Sesión cerrada (sin token activo)"
      });
    }

    const token = authHeader.substring(7);
    let decodedToken;

    try {
      decodedToken = jwt.verify(token, process.env.NEXTAUTH_SECRET || "your-secret-key");
    } catch (error) {
      // Si el token es inválido, considerar logout exitoso
      console.log("[Logout] Token inválido o expirado");
      return NextResponse.json({
        success: true,
        message: "Sesión cerrada (token inválido)"
      });
    }

    // Liberar cualquier turno en holding del usuario
    const releasedCount = await releaseUserHoldings(decodedToken.userId);
    if (releasedCount > 0) {
      console.log(`[Logout] Liberados ${releasedCount} turnos en holding del usuario ${decodedToken.userId}`);
    }

    // Limpiar TODAS las sesiones activas del usuario (no solo la del token actual)
    // Esto asegura que el cubículo se libere aunque haya múltiples sesiones
    const updateResult = await prisma.session.updateMany({
      where: {
        userId: decodedToken.userId,
        expiresAt: { gt: new Date() }
      },
      data: {
        selectedCubicleId: null,
        expiresAt: new Date(), // Marcar como expirada inmediatamente
        lastActivity: new Date()
      }
    });

    console.log(`[Logout] ${updateResult.count} sesiones cerradas para usuario ${decodedToken.userId}`);

    return NextResponse.json({
      success: true,
      message: "Sesión cerrada exitosamente"
    });

  } catch (error) {
    console.error("[Logout] Error al cerrar sesión:", error);
    // Incluso si hay error, devolver éxito para permitir logout en frontend
    return NextResponse.json({
      success: true,
      message: "Sesión cerrada (con advertencia)",
      warning: error.message
    });
  }
}

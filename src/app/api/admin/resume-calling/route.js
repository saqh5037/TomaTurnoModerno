import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

// POST - Reanudar llamados
export async function POST(request) {
  try {
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

    const userRole = decodedToken.role?.toLowerCase();
    if (!['admin', 'administrador', 'supervisor'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Acceso denegado" },
        { status: 403 }
      );
    }

    const now = new Date();
    const stateValue = JSON.stringify({
      paused: false,
      resumedAt: now.toISOString(),
      resumedBy: decodedToken.userId,
      resumedByName: decodedToken.name || decodedToken.userId
    });

    await prisma.systemState.upsert({
      where: { key: 'callingPaused' },
      update: { value: stateValue, updatedAt: now, updatedBy: decodedToken.userId },
      create: { key: 'callingPaused', value: stateValue, updatedAt: now, updatedBy: decodedToken.userId }
    });

    await prisma.auditLog.create({
      data: {
        userId: decodedToken.userId,
        action: "ADMIN_RESUME_CALLING",
        entity: "SystemState",
        entityId: null,
        oldValue: { paused: true },
        newValue: { paused: false },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    });

    console.log(`[Admin] Llamados reanudados por ${decodedToken.name || decodedToken.userId}`);

    return NextResponse.json({
      success: true,
      message: "Llamados reanudados exitosamente",
      data: { paused: false, resumedAt: now }
    });

  } catch (error) {
    console.error("[Admin Resume Calling] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al reanudar llamados" },
      { status: 500 }
    );
  }
}

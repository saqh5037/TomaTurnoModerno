import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

// POST - Pausar todos los llamados activos
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

    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Se requiere una razón (mínimo 5 caracteres)" },
        { status: 400 }
      );
    }

    const now = new Date();
    const stateValue = JSON.stringify({
      paused: true,
      pausedAt: now.toISOString(),
      pausedBy: decodedToken.userId,
      pausedByName: decodedToken.name || decodedToken.userId,
      reason: reason.trim()
    });

    // Upsert del estado global
    await prisma.systemState.upsert({
      where: { key: 'callingPaused' },
      update: { value: stateValue, updatedAt: now, updatedBy: decodedToken.userId },
      create: { key: 'callingPaused', value: stateValue, updatedAt: now, updatedBy: decodedToken.userId }
    });

    // Contar turnos en llamado para info
    const callingTurns = await prisma.turnRequest.count({
      where: { status: 'In Progress', isCalled: false }
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: decodedToken.userId,
        action: "ADMIN_PAUSE_CALLING",
        entity: "SystemState",
        entityId: null,
        oldValue: { paused: false },
        newValue: { paused: true, reason: reason.trim(), callingTurnsAffected: callingTurns },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    });

    console.log(`[Admin] Llamados pausados por ${decodedToken.name || decodedToken.userId}. Razón: ${reason}. Turnos en llamado afectados: ${callingTurns}`);

    return NextResponse.json({
      success: true,
      message: "Llamados pausados exitosamente",
      data: {
        paused: true,
        pausedAt: now,
        reason: reason.trim(),
        callingTurnsAffected: callingTurns
      }
    });

  } catch (error) {
    console.error("[Admin Pause Calling] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al pausar llamados" },
      { status: 500 }
    );
  }
}

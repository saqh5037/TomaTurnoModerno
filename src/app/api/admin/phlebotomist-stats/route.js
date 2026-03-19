import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

/**
 * GET /api/admin/phlebotomist-stats
 * Estadísticas en tiempo real de cada flebotomista activo hoy
 * Incluye: pacientes atendidos, tiempo promedio por toma, última toma, estado actual, omisiones
 */
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ success: false, error: "Token inválido" }, { status: 401 });
    }

    const userRole = decoded.role?.toLowerCase();
    if (!['admin', 'administrador', 'supervisor'].includes(userRole)) {
      return NextResponse.json({ success: false, error: "Acceso denegado" }, { status: 403 });
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const todayStart = new Date(`${todayStr}T00:00:00.000Z`);

    // Obtener todos los flebotomistas con sesión activa hoy o que hayan atendido hoy
    const usersWithActivity = await prisma.$queryRaw`
      SELECT DISTINCT u.id, u.name, u.role
      FROM "User" u
      WHERE u.id IN (
        -- Flebotomistas con sesión activa
        SELECT s."userId" FROM "Session" s WHERE s."expiresAt" > NOW()
        UNION
        -- Usuarios que atendieron hoy
        SELECT DISTINCT tr."attendedBy" FROM "TurnRequest" tr
        WHERE tr."attendedBy" IS NOT NULL AND tr."createdAt" >= ${todayStart}
      )
      ORDER BY u.name
    `;

    // Para cada usuario, calcular estadísticas
    const stats = await Promise.all(usersWithActivity.map(async (user) => {
      // Turnos atendidos hoy
      const attendedToday = await prisma.turnRequest.findMany({
        where: {
          attendedBy: user.id,
          status: 'Attended',
          finishedAt: { gte: todayStart }
        },
        select: {
          id: true,
          patientName: true,
          calledAt: true,
          attendedAt: true,
          finishedAt: true,
          tipoAtencion: true
        },
        orderBy: { finishedAt: 'desc' }
      });

      // Turno actual (In Progress)
      const currentTurn = await prisma.turnRequest.findFirst({
        where: { attendedBy: user.id, status: 'In Progress' },
        select: {
          id: true, patientName: true, assignedTurn: true,
          calledAt: true, tipoAtencion: true,
          cubicle: { select: { name: true } }
        }
      });

      // Turno en holding
      const holdingTurn = await prisma.turnRequest.findFirst({
        where: { holdingBy: user.id, status: 'Pending' },
        select: { id: true, patientName: true, assignedTurn: true, tipoAtencion: true }
      });

      // Sesión activa
      const session = await prisma.session.findFirst({
        where: { userId: user.id, expiresAt: { gt: now } },
        select: { selectedCubicleId: true, createdAt: true },
        orderBy: { lastActivity: 'desc' }
      });

      // Cubículo
      let cubicleName = null;
      if (session?.selectedCubicleId) {
        const cubicle = await prisma.cubicle.findUnique({
          where: { id: session.selectedCubicleId },
          select: { name: true }
        });
        cubicleName = cubicle?.name || null;
      }

      // Calcular tiempos
      const attentionTimes = attendedToday
        .filter(t => t.finishedAt && t.calledAt)
        .map(t => (new Date(t.finishedAt) - new Date(t.calledAt)) / 60000);

      const avgTimePerToma = attentionTimes.length > 0
        ? Math.round(attentionTimes.reduce((a, b) => a + b, 0) / attentionTimes.length * 10) / 10
        : null;

      const lastToma = attendedToday[0] || null;
      const lastTomaTime = lastToma?.finishedAt
        ? Math.round((new Date(lastToma.finishedAt) - new Date(lastToma.calledAt)) / 60000 * 10) / 10
        : null;

      // Turnos omitidos/saltados (diferidos por este usuario — buscamos en audit log)
      const skippedCount = await prisma.turnRequest.count({
        where: {
          isDeferred: true,
          createdAt: { gte: todayStart },
          // Los diferidos que pasaron por este flebotomista
        }
      });

      // Estado actual
      let status = 'offline';
      if (session) {
        if (currentTurn) status = 'atendiendo';
        else if (holdingTurn) status = 'con_holding';
        else status = 'disponible';
      }

      return {
        id: user.id,
        name: user.name,
        role: user.role,
        cubicleName,
        status,
        // Estadísticas
        attendedCount: attendedToday.length,
        avgTimePerToma,
        lastTomaTime,
        lastTomaPatient: lastToma?.patientName || null,
        lastTomaFinished: lastToma?.finishedAt || null,
        // Estado actual
        currentPatient: currentTurn?.patientName || null,
        currentTurnNumber: currentTurn?.assignedTurn || null,
        currentCubicle: currentTurn?.cubicle?.name || cubicleName || null,
        currentCalledAt: currentTurn?.calledAt || null,
        holdingPatient: holdingTurn?.patientName || null,
        holdingTurnNumber: holdingTurn?.assignedTurn || null,
        // Login
        loginTime: session?.createdAt || null,
      };
    }));

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error("[phlebotomist-stats] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

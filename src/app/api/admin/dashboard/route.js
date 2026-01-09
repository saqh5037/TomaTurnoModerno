import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

// Umbrales para alertas (en minutos)
const ALERT_THRESHOLDS = {
  LONG_WAIT: 30,           // Turno esperando > 30 min
  LONG_ATTENTION: 20,      // Turno en atención > 20 min
  EXPIRED_HOLDING: 5,      // Holding expirado > 5 min
  INACTIVE_CUBICLE: 15,    // Cubículo sin actividad > 15 min
  INACTIVE_PHLEBOTOMIST: 10 // Flebotomista sin atender > 10 min
};

// GET - Obtener estadísticas del dashboard en tiempo real
export async function GET(request) {
  try {
    // Verificar autorización
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

    // Verificar rol (solo admin y supervisor)
    const userRole = decodedToken.role?.toLowerCase();
    if (!['admin', 'administrador', 'supervisor'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Acceso denegado. Se requiere rol de administrador o supervisor." },
        { status: 403 }
      );
    }

    // Obtener inicio del día actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    // Contar turnos por estado (solo del día actual)
    const [pending, inProgress, attended, cancelled, holding] = await Promise.all([
      // Pending (sin holding)
      prisma.turnRequest.count({
        where: {
          status: "Pending",
          holdingBy: null,
          createdAt: { gte: today }
        }
      }),
      // In Progress
      prisma.turnRequest.count({
        where: {
          status: "In Progress",
          createdAt: { gte: today }
        }
      }),
      // Attended (finalizados)
      prisma.turnRequest.count({
        where: {
          status: "Attended",
          createdAt: { gte: today }
        }
      }),
      // Cancelled
      prisma.turnRequest.count({
        where: {
          status: "Cancelled",
          createdAt: { gte: today }
        }
      }),
      // En Holding
      prisma.turnRequest.count({
        where: {
          status: "Pending",
          holdingBy: { not: null },
          createdAt: { gte: today }
        }
      })
    ]);

    const total = pending + inProgress + attended + cancelled + holding;

    // Calcular tiempos promedio
    const avgTimes = await prisma.$queryRaw`
      SELECT
        AVG(EXTRACT(EPOCH FROM ("calledAt" - "createdAt")) / 60) as avg_wait_time,
        AVG(EXTRACT(EPOCH FROM ("finishedAt" - "attendedAt")) / 60) as avg_attention_time
      FROM "TurnRequest"
      WHERE "createdAt" >= ${today}
        AND status = 'Attended'
        AND "calledAt" IS NOT NULL
        AND "finishedAt" IS NOT NULL
    `;

    const avgWaitTime = avgTimes[0]?.avg_wait_time
      ? parseFloat(avgTimes[0].avg_wait_time).toFixed(1)
      : 0;
    const avgAttentionTime = avgTimes[0]?.avg_attention_time
      ? parseFloat(avgTimes[0].avg_attention_time).toFixed(1)
      : 0;

    // Detectar alertas
    const alerts = [];

    // 1. Turnos esperando demasiado tiempo
    const longWaitTurns = await prisma.turnRequest.findMany({
      where: {
        status: "Pending",
        holdingBy: null,
        createdAt: {
          gte: today,
          lt: new Date(now.getTime() - ALERT_THRESHOLDS.LONG_WAIT * 60 * 1000)
        }
      },
      select: { id: true, assignedTurn: true, patientName: true, createdAt: true }
    });

    for (const turn of longWaitTurns) {
      const waitMinutes = Math.floor((now - new Date(turn.createdAt)) / 60000);
      alerts.push({
        type: 'LONG_WAIT',
        severity: 'warning',
        turnId: turn.id,
        assignedTurn: turn.assignedTurn,
        patientName: turn.patientName,
        message: `Turno ${turn.assignedTurn} esperando ${waitMinutes} min`,
        minutes: waitMinutes
      });
    }

    // 2. Turnos en atención demasiado tiempo
    const longAttentionTurns = await prisma.turnRequest.findMany({
      where: {
        status: "In Progress",
        attendedAt: {
          lt: new Date(now.getTime() - ALERT_THRESHOLDS.LONG_ATTENTION * 60 * 1000)
        },
        createdAt: { gte: today }
      },
      select: { id: true, assignedTurn: true, patientName: true, attendedAt: true },
    });

    for (const turn of longAttentionTurns) {
      const attentionMinutes = Math.floor((now - new Date(turn.attendedAt)) / 60000);
      alerts.push({
        type: 'LONG_ATTENTION',
        severity: 'warning',
        turnId: turn.id,
        assignedTurn: turn.assignedTurn,
        patientName: turn.patientName,
        message: `Turno ${turn.assignedTurn} en atención ${attentionMinutes} min`,
        minutes: attentionMinutes
      });
    }

    // 3. Holdings expirados
    const expiredHoldings = await prisma.turnRequest.findMany({
      where: {
        status: "Pending",
        holdingBy: { not: null },
        holdingAt: {
          lt: new Date(now.getTime() - ALERT_THRESHOLDS.EXPIRED_HOLDING * 60 * 1000)
        },
        createdAt: { gte: today }
      },
      select: {
        id: true,
        assignedTurn: true,
        patientName: true,
        holdingAt: true,
        holdingUser: { select: { name: true } }
      },
    });

    for (const turn of expiredHoldings) {
      const holdingMinutes = Math.floor((now - new Date(turn.holdingAt)) / 60000);
      alerts.push({
        type: 'EXPIRED_HOLDING',
        severity: 'error',
        turnId: turn.id,
        assignedTurn: turn.assignedTurn,
        patientName: turn.patientName,
        phlebotomistName: turn.holdingUser?.name,
        message: `Holding expirado: Turno ${turn.assignedTurn} (${holdingMinutes} min) - ${turn.holdingUser?.name || 'Sin asignar'}`,
        minutes: holdingMinutes
      });
    }

    // Ordenar alertas por severidad y tiempo
    alerts.sort((a, b) => {
      if (a.severity === 'error' && b.severity !== 'error') return -1;
      if (b.severity === 'error' && a.severity !== 'error') return 1;
      return b.minutes - a.minutes;
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total,
          pending,
          inProgress,
          attended,
          cancelled,
          holding,
          avgWaitTime: parseFloat(avgWaitTime),
          avgAttentionTime: parseFloat(avgAttentionTime)
        },
        alerts,
        alertsCount: alerts.length,
        timestamp: now.toISOString()
      }
    });

  } catch (error) {
    console.error("[Admin Dashboard] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener datos del dashboard" },
      { status: 500 }
    );
  }
}

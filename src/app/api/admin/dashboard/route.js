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

    // Contar turnos por estado (solo del día actual para estadísticas)
    const [pending, inProgressTotal, attended, cancelled, holding, inCalling, inAttention] = await Promise.all([
      // Pending (sin holding)
      prisma.turnRequest.count({
        where: {
          status: "Pending",
          holdingBy: null,
          createdAt: { gte: today }
        }
      }),
      // In Progress (total)
      prisma.turnRequest.count({
        where: {
          status: "In Progress",
          createdAt: { gte: today }
        }
      }),
      // Attended (finalizados HOY - por finishedAt, no createdAt)
      prisma.turnRequest.count({
        where: {
          status: "Attended",
          finishedAt: { gte: today }
        }
      }),
      // Cancelled (cancelados HOY - por finishedAt, no createdAt)
      prisma.turnRequest.count({
        where: {
          status: "Cancelled",
          finishedAt: { gte: today }
        }
      }),
      // En Holding
      prisma.turnRequest.count({
        where: {
          status: "Pending",
          holdingBy: { not: null },
          createdAt: { gte: today }
        }
      }),
      // In Calling (In Progress + isCalled = false) - siendo llamados
      prisma.turnRequest.count({
        where: {
          status: "In Progress",
          isCalled: false,
          createdAt: { gte: today }
        }
      }),
      // In Attention (In Progress + isCalled = true) - en atención real
      prisma.turnRequest.count({
        where: {
          status: "In Progress",
          isCalled: true,
          createdAt: { gte: today }
        }
      })
    ]);

    const total = pending + inProgressTotal + attended + cancelled + holding;

    // ========== DATOS EN TIEMPO REAL (sin filtro de fecha) ==========
    const [realtimePending, realtimeHolding, realtimeInCalling, realtimeInProgress] = await Promise.all([
      // Pending activos (sin holding, sin filtro de fecha)
      prisma.turnRequest.count({
        where: {
          status: "Pending",
          holdingBy: null
        }
      }),
      // En Holding activos
      prisma.turnRequest.count({
        where: {
          status: "Pending",
          holdingBy: { not: null }
        }
      }),
      // Siendo llamados (In Progress + isCalled = false)
      prisma.turnRequest.count({
        where: {
          status: "In Progress",
          isCalled: false
        }
      }),
      // En atención real (In Progress + isCalled = true)
      prisma.turnRequest.count({
        where: {
          status: "In Progress",
          isCalled: true
        }
      })
    ]);

    // ========== FLEBOTOMISTAS ACTIVOS ==========
    const activeSessions = await prisma.session.findMany({
      where: {
        expiresAt: { gt: now },
        selectedCubicleId: { not: null }
      },
      include: {
        user: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    // Obtener cubículos de las sesiones activas
    const activeCubicleIds = activeSessions
      .map(s => s.selectedCubicleId)
      .filter(id => id !== null);

    const cubiclesData = await prisma.cubicle.findMany({
      where: { isActive: true },
      select: { id: true, name: true, type: true },
      orderBy: { name: 'asc' }
    });

    // Obtener turnos en progreso para cada flebotomista
    const turnsInProgress = await prisma.turnRequest.findMany({
      where: {
        status: "In Progress",
        attendedBy: { not: null }
      },
      select: {
        id: true,
        assignedTurn: true,
        patientName: true,
        attendedBy: true,
        cubicleId: true,
        isCalled: true
      }
    });

    // Obtener turnos en holding
    const turnsInHolding = await prisma.turnRequest.findMany({
      where: {
        status: "Pending",
        holdingBy: { not: null }
      },
      select: {
        id: true,
        assignedTurn: true,
        patientName: true,
        holdingBy: true
      }
    });

    // Construir lista de flebotomistas activos
    const phlebotomists = activeSessions
      .filter(s => s.user && ['flebotomista', 'Flebotomista'].includes(s.user.role))
      .map(session => {
        const cubicle = cubiclesData.find(c => c.id === session.selectedCubicleId);
        const currentTurn = turnsInProgress.find(t => t.attendedBy === session.user.id);
        const holdingTurn = turnsInHolding.find(t => t.holdingBy === session.user.id);

        let status = 'disponible';
        let currentPatient = null;
        let currentTurnNumber = null;

        if (currentTurn) {
          status = currentTurn.isCalled ? 'atendiendo' : 'llamando';
          currentPatient = currentTurn.patientName;
          currentTurnNumber = currentTurn.assignedTurn;
        } else if (holdingTurn) {
          status = 'con_holding';
          currentPatient = holdingTurn.patientName;
          currentTurnNumber = holdingTurn.assignedTurn;
        }

        return {
          id: session.user.id,
          name: session.user.name,
          cubicleId: session.selectedCubicleId,
          cubicleName: cubicle?.name || 'Sin cubículo',
          cubicleType: cubicle?.type || 'GENERAL',
          status,
          currentPatient,
          currentTurnNumber,
          lastActivity: session.lastActivity
        };
      });

    // ========== ESTADO DE CUBÍCULOS ==========
    const cubicles = cubiclesData.map(cubicle => {
      const session = activeSessions.find(s => s.selectedCubicleId === cubicle.id);
      const turn = turnsInProgress.find(t => t.cubicleId === cubicle.id);

      return {
        id: cubicle.id,
        name: cubicle.name,
        type: cubicle.type,
        isOccupied: !!session,
        phlebotomistId: session?.user?.id || null,
        phlebotomistName: session?.user?.name || null,
        currentPatient: turn?.patientName || null,
        currentTurnNumber: turn?.assignedTurn || null,
        status: turn ? (turn.isCalled ? 'atendiendo' : 'llamando') : (session ? 'disponible' : 'libre')
      };
    });

    const occupiedCubicles = cubicles.filter(c => c.isOccupied);
    const freeCubicles = cubicles.filter(c => !c.isOccupied);

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
          inProgress: inProgressTotal,
          inCalling,
          inAttention,
          attended,
          cancelled,
          holding,
          avgWaitTime: parseFloat(avgWaitTime),
          avgAttentionTime: parseFloat(avgAttentionTime)
        },
        // Datos en tiempo real (sin filtro de fecha) - para espejo exacto de monitoreo
        realtime: {
          pendingCount: realtimePending,
          holdingCount: realtimeHolding,
          inCallingCount: realtimeInCalling,
          inProgressCount: realtimeInProgress,
          totalActive: realtimePending + realtimeHolding + realtimeInCalling + realtimeInProgress
        },
        // Flebotomistas activos con su estado
        phlebotomists,
        phlebotomistsCount: phlebotomists.length,
        // Estado de cubículos
        cubicles: {
          all: cubicles,
          occupied: occupiedCubicles,
          free: freeCubicles,
          occupiedCount: occupiedCubicles.length,
          freeCount: freeCubicles.length,
          totalCount: cubicles.length
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

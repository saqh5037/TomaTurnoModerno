import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

// Umbrales para alertas (en minutos)
const ALERT_THRESHOLDS = {
  LONG_WAIT: 30,
  LONG_ATTENTION: 20,
  EXPIRED_HOLDING: 5
};

// GET - Obtener lista de turnos con filtros
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
        { success: false, error: "Acceso denegado" },
        { status: 403 }
      );
    }

    // Obtener parámetros de filtro
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const phlebotomistId = searchParams.get('phlebotomistId');
    const cubicleId = searchParams.get('cubicleId');
    const search = searchParams.get('search');
    const priority = searchParams.get('priority'); // Special o General
    const showHolding = searchParams.get('showHolding'); // 'true' para mostrar solo holdings
    const activeOnly = searchParams.get('activeOnly'); // 'true' para mostrar solo turnos activos sin filtro de fecha
    const dateFilter = searchParams.get('date'); // Fecha específica (YYYY-MM-DD)

    // Inicio del día actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    // Construir condiciones de filtro
    const where = {};

    // Por defecto filtra por fecha de hoy, pero si activeOnly=true muestra todos los activos
    if (activeOnly === 'true') {
      // Solo turnos activos (Pending o In Progress) sin filtro de fecha
      where.status = { in: ['Pending', 'In Progress'] };
    } else if (dateFilter) {
      // Filtro por fecha específica
      const filterDate = new Date(dateFilter);
      filterDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.createdAt = { gte: filterDate, lt: nextDay };
    } else {
      // Filtro por fecha de hoy (comportamiento original)
      where.createdAt = { gte: today };
    }

    // Filtro por estado (sobrescribe el filtro de activeOnly si se especifica)
    if (status) {
      if (status === 'Holding') {
        where.status = 'Pending';
        where.holdingBy = { not: null };
      } else if (status === 'Calling') {
        // Nuevo estado: siendo llamado (In Progress + isCalled = false)
        where.status = 'In Progress';
        where.isCalled = false;
      } else {
        where.status = status;
        if (status === 'Pending') {
          // Pending sin holding (a menos que showHolding sea true)
          if (showHolding !== 'true') {
            where.holdingBy = null;
          }
        }
      }
    }

    // Filtro por flebotomista (attendedBy o holdingBy)
    if (phlebotomistId) {
      const pId = parseInt(phlebotomistId);
      where.OR = [
        { attendedBy: pId },
        { holdingBy: pId }
      ];
    }

    // Filtro por cubículo
    if (cubicleId) {
      where.cubicleId = parseInt(cubicleId);
    }

    // Filtro por prioridad
    if (priority) {
      where.tipoAtencion = priority;
    }

    // Búsqueda por nombre o número de turno
    if (search) {
      const searchNum = parseInt(search);
      if (!isNaN(searchNum)) {
        where.OR = [
          { patientName: { contains: search, mode: 'insensitive' } },
          { assignedTurn: searchNum }
        ];
      } else {
        where.patientName = { contains: search, mode: 'insensitive' };
      }
    }

    // Obtener turnos con relaciones
    const turnsRaw = await prisma.turnRequest.findMany({
      where,
      include: {
        cubicle: {
          select: { id: true, name: true, type: true }
        },
        user: {
          select: { id: true, name: true }
        },
        holdingUser: {
          select: { id: true, name: true }
        }
      }
    });

    // Ordenar consistente con /api/queue/list:
    // 1. Por estado (Pending primero, luego In Progress, luego otros)
    // 2. Por tipoAtencion (Special primero)
    // 3. Por COALESCE(deferredAt, createdAt) - tiempo efectivo de cola
    const statusOrder = { 'Pending': 0, 'In Progress': 1, 'Attended': 2, 'Cancelled': 3 };
    const turns = turnsRaw.sort((a, b) => {
      // Primero por estado
      const statusDiff = (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4);
      if (statusDiff !== 0) return statusDiff;

      // Luego por tipo de atención (Special primero)
      if (a.tipoAtencion === 'Special' && b.tipoAtencion !== 'Special') return -1;
      if (b.tipoAtencion === 'Special' && a.tipoAtencion !== 'Special') return 1;

      // Finalmente por tiempo efectivo de cola (COALESCE(deferredAt, createdAt))
      const aTime = a.deferredAt || a.createdAt;
      const bTime = b.deferredAt || b.createdAt;
      return new Date(aTime) - new Date(bTime);
    });

    // Enriquecer datos con tiempos y alertas
    const enrichedTurns = turns.map(turn => {
      const waitTime = turn.calledAt
        ? Math.floor((new Date(turn.calledAt) - new Date(turn.createdAt)) / 60000)
        : Math.floor((now - new Date(turn.createdAt)) / 60000);

      const attentionTime = turn.finishedAt && turn.attendedAt
        ? Math.floor((new Date(turn.finishedAt) - new Date(turn.attendedAt)) / 60000)
        : turn.attendedAt
          ? Math.floor((now - new Date(turn.attendedAt)) / 60000)
          : null;

      const holdingTime = turn.holdingAt
        ? Math.floor((now - new Date(turn.holdingAt)) / 60000)
        : null;

      // Detectar alertas
      let hasAlert = false;
      let alertType = null;

      if (turn.status === 'Pending' && turn.holdingBy) {
        // Holding expirado
        if (holdingTime > ALERT_THRESHOLDS.EXPIRED_HOLDING) {
          hasAlert = true;
          alertType = 'EXPIRED_HOLDING';
        }
      } else if (turn.status === 'Pending' && !turn.holdingBy) {
        // Espera larga
        if (waitTime > ALERT_THRESHOLDS.LONG_WAIT) {
          hasAlert = true;
          alertType = 'LONG_WAIT';
        }
      } else if (turn.status === 'In Progress') {
        // Atención larga
        if (attentionTime > ALERT_THRESHOLDS.LONG_ATTENTION) {
          hasAlert = true;
          alertType = 'LONG_ATTENTION';
        }
      }

      // Determinar estado visual
      let visualStatus = turn.status;
      if (turn.status === 'Pending' && turn.holdingBy) {
        visualStatus = 'Holding';
      } else if (turn.status === 'In Progress' && !turn.isCalled) {
        visualStatus = 'Calling';
      }

      return {
        id: turn.id,
        assignedTurn: turn.assignedTurn,
        patientName: turn.patientName,
        patientID: turn.patientID,
        workOrder: turn.workOrder,
        age: turn.age,
        gender: turn.gender,
        status: turn.status,
        visualStatus,
        tipoAtencion: turn.tipoAtencion,
        isSpecial: turn.tipoAtencion === 'Special',
        isDeferred: turn.isDeferred,
        isCalled: turn.isCalled,
        callCount: turn.callCount,
        cubicle: turn.cubicle,
        attendedBy: turn.user ? { id: turn.user.id, name: turn.user.name } : null,
        holdingBy: turn.holdingUser ? { id: turn.holdingUser.id, name: turn.holdingUser.name } : null,
        createdAt: turn.createdAt,
        calledAt: turn.calledAt,
        attendedAt: turn.attendedAt,
        finishedAt: turn.finishedAt,
        holdingAt: turn.holdingAt,
        deferredAt: turn.deferredAt,
        waitTime,
        attentionTime,
        holdingTime,
        hasAlert,
        alertType
      };
    });

    // Obtener lista de flebotomistas con sesión activa (logged in) para filtros
    const phlebotomists = await prisma.user.findMany({
      where: {
        role: { in: ['flebotomista', 'Flebotomista'] },
        isActive: true,
        sessions: {
          some: {
            expiresAt: { gt: now }  // Solo flebotomistas con sesión no expirada
          }
        }
      },
      select: { id: true, name: true }
    });

    // Obtener lista de cubículos activos para filtros
    const cubicles = await prisma.cubicle.findMany({
      where: { isActive: true },
      select: { id: true, name: true, type: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: {
        turns: enrichedTurns,
        total: enrichedTurns.length,
        filters: {
          phlebotomists,
          cubicles
        },
        timestamp: now.toISOString()
      }
    });

  } catch (error) {
    console.error("[Admin Turns] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener turnos" },
      { status: 500 }
    );
  }
}

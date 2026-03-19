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
    const dateFrom = searchParams.get('dateFrom'); // Rango desde (YYYY-MM-DD)
    const dateTo = searchParams.get('dateTo'); // Rango hasta (YYYY-MM-DD)
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = (page - 1) * limit;

    // Inicio del día actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    // Construir condiciones de filtro
    const where = {};
    const andConditions = [];

    // Por defecto filtra por fecha de hoy, pero si activeOnly=true muestra todos los activos
    // IMPORTANTE: Usar strings ISO con T00:00:00Z/T23:59:59Z para evitar problemas de timezone del servidor
    if (activeOnly === 'true') {
      // Solo turnos activos (Pending o In Progress) sin filtro de fecha
      where.status = { in: ['Pending', 'In Progress'] };
    } else if (dateFrom || dateTo) {
      // Rango de fechas (timezone-safe)
      const dateField = status === 'Attended' ? 'finishedAt' : 'createdAt';
      const rangeFilter = {};
      if (dateFrom) {
        rangeFilter.gte = new Date(`${dateFrom}T00:00:00.000Z`);
      }
      if (dateTo) {
        rangeFilter.lte = new Date(`${dateTo}T23:59:59.999Z`);
      }
      where[dateField] = rangeFilter;
    } else if (dateFilter) {
      // Filtro por fecha específica (timezone-safe)
      const dateField = status === 'Attended' ? 'finishedAt' : 'createdAt';
      where[dateField] = {
        gte: new Date(`${dateFilter}T00:00:00.000Z`),
        lte: new Date(`${dateFilter}T23:59:59.999Z`)
      };
    } else {
      // Filtro por fecha de hoy (timezone-safe)
      const todayStr = now.toISOString().split('T')[0];
      where.createdAt = { gte: new Date(`${todayStr}T00:00:00.000Z`) };
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

    // Filtro por flebotomista — no aplicar para Cancelados (no tienen attendedBy)
    if (phlebotomistId && status !== 'Cancelled') {
      const pId = parseInt(phlebotomistId);
      andConditions.push({
        OR: [{ attendedBy: pId }, { holdingBy: pId }]
      });
    }

    // Filtro por cubículo
    if (cubicleId) {
      where.cubicleId = parseInt(cubicleId);
    }

    // Filtro por prioridad
    if (priority) {
      where.tipoAtencion = priority;
    }

    // Búsqueda por nombre o número de turno — usar andConditions para no sobrescribir
    if (search) {
      const searchNum = parseInt(search);
      if (!isNaN(searchNum)) {
        andConditions.push({
          OR: [
            { patientName: { contains: search, mode: 'insensitive' } },
            { assignedTurn: searchNum }
          ]
        });
      } else {
        andConditions.push({
          patientName: { contains: search, mode: 'insensitive' }
        });
      }
    }

    // Combinar todas las condiciones AND
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Obtener total para paginación
    const totalCount = await prisma.turnRequest.count({ where });

    // Obtener turnos con relaciones y paginación
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
      },
      skip,
      take: limit
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

      // Luego por tipo de atención (4 niveles de prioridad)
      const prioridadOrden = { MuyEspecial: 0, Prioritario: 1, PrioritarioRiesgo: 1, RiesgoCaida: 2, General: 2, Special: 1 };
      const prioDiff = (prioridadOrden[a.tipoAtencion] ?? 2) - (prioridadOrden[b.tipoAtencion] ?? 2);
      if (prioDiff !== 0) return prioDiff;

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
        isSpecial: ['MuyEspecial', 'Prioritario', 'PrioritarioRiesgo', 'Special'].includes(turn.tipoAtencion),
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
        alertType,
        // Campos adicionales para detalle
        studies: turn.studies_json || [],
        observations: turn.observations,
        contactInfo: turn.contactInfo,
        tubesRequired: turn.tubesRequired
      };
    });

    // Obtener razones de cancelación para turnos cancelados
    const cancelledTurnIds = enrichedTurns.filter(t => t.status === 'Cancelled').map(t => String(t.id));
    if (cancelledTurnIds.length > 0) {
      const cancelLogs = await prisma.auditLog.findMany({
        where: {
          action: 'ADMIN_CANCEL_TURN',
          entityId: { in: cancelledTurnIds }
        },
        select: { entityId: true, newValue: true }
      });
      const reasonMap = {};
      for (const log of cancelLogs) {
        const nv = log.newValue;
        if (nv && typeof nv === 'object' && nv.reason) {
          reasonMap[log.entityId] = nv.reason;
        }
      }
      for (const turn of enrichedTurns) {
        if (turn.status === 'Cancelled') {
          turn.cancellationReason = reasonMap[String(turn.id)] || null;
        }
      }
    }

    // Obtener personal: con sesión activa O que hayan atendido hoy
    const todayForFilter = new Date(`${now.toISOString().split('T')[0]}T00:00:00.000Z`);
    const phlebotomists = await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { sessions: { some: { expiresAt: { gt: now } } } },
          { turnRequests: { some: { finishedAt: { gte: todayForFilter } } } }
        ]
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
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
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

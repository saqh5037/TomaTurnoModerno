import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../lib/prisma.js";
import { PRIORIDAD_ORDEN } from "../../../../lib/prioridadUtils.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

// GET - Obtener turnos organizados para preparación de documentos
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

    // Verificar rol (todos los roles del sistema)
    const userRole = decodedToken.role?.toLowerCase();
    if (!['admin', 'administrador', 'supervisor', 'flebotomista', 'recepcion', 'recepción'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Acceso denegado" },
        { status: 403 }
      );
    }

    // Fecha de inicio del día actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Contar atendidos hoy
    const attendedToday = await prisma.turnRequest.count({
      where: {
        status: 'Attended',
        finishedAt: { gte: today }
      }
    });

    // Obtener turno siendo llamado actualmente
    const callingTurn = await prisma.turnRequest.findFirst({
      where: {
        status: 'In Progress',
        isCalled: true
      },
      include: {
        cubicle: { select: { name: true } }
      }
    });

    // Obtener TODOS los turnos prioritarios pendientes (saltan la fila)
    const priorityTurns = await prisma.turnRequest.findMany({
      where: {
        status: 'Pending',
        tipoAtencion: { in: ['MuyEspecial', 'Prioritario', 'PrioritarioRiesgo'] }
      },
      orderBy: [
        { deferredAt: { sort: 'asc', nulls: 'first' } },
        { createdAt: 'asc' }
      ],
      select: {
        id: true,
        patientName: true,
        workOrder: true,
        tubesRequired: true,
        studies: true,
        studies_json: true,
        isDeferred: true,
        tipoAtencion: true,
        deferredAt: true,
        createdAt: true
      }
    });

    // Ordenar prioritarios: MuyEspecial primero, luego Prioritario/PrioritarioRiesgo por tiempo
    priorityTurns.sort((a, b) => {
      const pa = PRIORIDAD_ORDEN[a.tipoAtencion] ?? 2;
      const pb = PRIORIDAD_ORDEN[b.tipoAtencion] ?? 2;
      if (pa !== pb) return pa - pb;
      const aTime = a.deferredAt || a.createdAt;
      const bTime = b.deferredAt || b.createdAt;
      return new Date(aTime) - new Date(bTime);
    });

    // Obtener TODOS los turnos generales pendientes (NO saltan la fila)
    const generalTurns = await prisma.turnRequest.findMany({
      where: {
        status: 'Pending',
        tipoAtencion: { in: ['General', 'RiesgoCaida'] }
      },
      orderBy: [
        { deferredAt: { sort: 'asc', nulls: 'first' } },
        { createdAt: 'asc' }
      ],
      select: {
        id: true,
        patientName: true,
        workOrder: true,
        tubesRequired: true,
        studies: true,
        studies_json: true,
        isDeferred: true,
        tipoAtencion: true
      }
    });

    // Función helper para contar estudios
    const countStudies = (turn) => {
      if (turn.studies_json && Array.isArray(turn.studies_json)) {
        return turn.studies_json.length;
      }
      if (turn.studies) {
        try {
          const parsed = JSON.parse(turn.studies);
          return Array.isArray(parsed) ? parsed.length : 1;
        } catch {
          return turn.studies.split(',').length;
        }
      }
      return 0;
    };

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          attendedToday,
          pendingTotal: priorityTurns.length + generalTurns.length,
          pendingPriority: priorityTurns.length,
          pendingGeneral: generalTurns.length,
          callingNow: callingTurn ? 1 : 0
        },
        callingTurn: callingTurn ? {
          id: callingTurn.id,
          patientName: callingTurn.patientName,
          workOrder: callingTurn.workOrder,
          tubesRequired: callingTurn.tubesRequired || 0,
          studiesCount: countStudies(callingTurn),
          tipoAtencion: callingTurn.tipoAtencion,
          cubicleName: callingTurn.cubicle?.name || '-'
        } : null,
        priorityTurns: priorityTurns.map((t, idx) => ({
          id: t.id,
          position: idx + 1,
          patientName: t.patientName,
          workOrder: t.workOrder,
          tubesRequired: t.tubesRequired || 0,
          studiesCount: countStudies(t),
          isNext: idx < 3,
          isDeferred: t.isDeferred || false,
          tipoAtencion: t.tipoAtencion
        })),
        generalTurns: generalTurns.map((t, idx) => ({
          id: t.id,
          position: idx + 1,
          patientName: t.patientName,
          workOrder: t.workOrder,
          tubesRequired: t.tubesRequired || 0,
          studiesCount: countStudies(t),
          isNext: idx < 3,
          isDeferred: t.isDeferred || false,
          tipoAtencion: t.tipoAtencion
        }))
      }
    });

  } catch (error) {
    console.error('Error en document-prep:', error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

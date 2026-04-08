import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prisma.js";
import { calculateDurationMinutes } from "../../../../../lib/patientStatsUtils.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

const ALLOWED_ROLES = ["admin", "administrador", "supervisor", "flebotomista"];
const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;

// GET - Lista de turnos atendidos con detalle por paciente
export async function GET(request) {
  try {
    // Auth
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
    if (!ALLOWED_ROLES.includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Acceso denegado" },
        { status: 403 }
      );
    }

    // Parámetros
    const { searchParams } = new URL(request.url);

    // Default: hoy en formato YYYY-MM-DD
    const todayStr = new Date().toISOString().split("T")[0];
    const dateFrom = searchParams.get("dateFrom") || todayStr;
    const dateTo = searchParams.get("dateTo") || todayStr;

    const phlebotomistId = searchParams.get("phlebotomistId");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    let limit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT));
    if (Number.isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    // Construir where (timezone-safe igual que /api/admin/turns)
    const where = {
      status: "Attended",
      finishedAt: {
        gte: new Date(`${dateFrom}T00:00:00.000Z`),
        lte: new Date(`${dateTo}T23:59:59.999Z`),
      },
    };

    if (phlebotomistId) {
      const pId = parseInt(phlebotomistId);
      if (!Number.isNaN(pId)) {
        where.attendedBy = pId;
      }
    }

    if (search && search.trim()) {
      const trimmed = search.trim();
      const searchNum = parseInt(trimmed);
      const orClauses = [
        { patientName: { contains: trimmed, mode: "insensitive" } },
        { workOrder: { contains: trimmed, mode: "insensitive" } },
      ];
      if (!Number.isNaN(searchNum)) {
        orClauses.push({ assignedTurn: searchNum });
      }
      where.OR = orClauses;
    }

    // Query + count en paralelo
    const [rowsRaw, total] = await Promise.all([
      prisma.turnRequest.findMany({
        where,
        select: {
          id: true,
          assignedTurn: true,
          patientName: true,
          workOrder: true,
          createdAt: true,
          calledAt: true,
          finishedAt: true,
          tipoAtencion: true,
          user: { select: { id: true, name: true } }, // relación attendedBy
        },
        orderBy: { finishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.turnRequest.count({ where }),
    ]);

    const rows = rowsRaw.map((t) => {
      const startTime = t.calledAt || t.createdAt;
      const endTime = t.finishedAt;
      return {
        id: t.id,
        turnNumber: t.assignedTurn,
        workOrder: t.workOrder,
        patientName: t.patientName,
        startTime,
        endTime,
        durationMinutes: calculateDurationMinutes(startTime, endTime),
        phlebotomistId: t.user?.id ?? null,
        phlebotomistName: t.user?.name ?? "—",
        tipoAtencion: t.tipoAtencion,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        rows,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("[patient-stats] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

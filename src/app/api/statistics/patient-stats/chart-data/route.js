import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../../lib/prisma.js";
import { calculateDurationMinutes } from "../../../../../../lib/patientStatsUtils.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

const ALLOWED_ROLES = ["admin", "administrador", "supervisor", "flebotomista"];
const INT4_MAX = 2147483647;

/**
 * GET /api/statistics/patient-stats/chart-data
 *
 * Devuelve datos agregados del endpoint patient-stats para alimentar
 * el dashboard de gráficas: bins de 30 min, distribución por tipo de
 * atención, top flebotomistas, y KPIs.
 *
 * Acepta los mismos filtros que el endpoint tabular patient-stats:
 * dateFrom, dateTo, phlebotomistId, search.
 *
 * Respuesta:
 *   {
 *     success: true,
 *     data: {
 *       kpis: { totalAttended, avgDurationMin, peakHourLabel, peakHourCount, topPhlebotomistName, topPhlebotomistCount },
 *       halfHourBins: [{ label: "07:00", count: N, avgDuration: M }, ...],
 *       byType: [{ type, label, count }, ...],
 *       topPhlebotomists: [{ name, count }, ...],  // top 10
 *     }
 *   }
 */
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

    // Parámetros (mismo shape que el endpoint tabular)
    const { searchParams } = new URL(request.url);
    const todayStr = new Date().toISOString().split("T")[0];
    const dateFrom = searchParams.get("dateFrom") || todayStr;
    const dateTo = searchParams.get("dateTo") || todayStr;
    const phlebotomistId = searchParams.get("phlebotomistId");
    const search = searchParams.get("search");

    // Where clause idéntico al endpoint tabular
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
      if (
        !Number.isNaN(searchNum) &&
        searchNum > 0 &&
        searchNum <= INT4_MAX
      ) {
        orClauses.push({ assignedTurn: searchNum });
      }
      where.OR = orClauses;
    }

    // Traemos todos los turnos del rango (sin paginar, hasta 50k para seguridad)
    const turns = await prisma.turnRequest.findMany({
      where,
      select: {
        createdAt: true,
        calledAt: true,
        finishedAt: true,
        tipoAtencion: true,
        user: { select: { id: true, name: true } },
      },
      take: 50000,
    });

    // ===== 1. Bins de 30 min por hora de inicio (calledAt || createdAt) =====
    // Usamos la hora local de México (UTC-6) asumiendo que los timestamps
    // están en UTC. Para INER esto es consistente con las otras pantallas.
    const MX_OFFSET_MIN = -6 * 60; // UTC-6

    // Rango operativo: 6:00 AM a 8:00 PM → 28 bins de 30 min
    const BIN_START_HOUR = 6;
    const BIN_END_HOUR = 20;
    const NUM_BINS = (BIN_END_HOUR - BIN_START_HOUR) * 2;

    const bins = Array.from({ length: NUM_BINS }, (_, i) => {
      const totalMin = BIN_START_HOUR * 60 + i * 30;
      const hh = String(Math.floor(totalMin / 60)).padStart(2, "0");
      const mm = String(totalMin % 60).padStart(2, "0");
      return {
        label: `${hh}:${mm}`,
        count: 0,
        totalDuration: 0,
      };
    });

    // Bin "fuera de rango" por seguridad (muy temprano/tarde)
    let outOfRangeCount = 0;

    turns.forEach((t) => {
      const startISO = t.calledAt || t.createdAt;
      if (!startISO) return;

      // Convertir UTC a hora local México
      const utcDate = new Date(startISO);
      const mxMinutes = utcDate.getUTCHours() * 60 + utcDate.getUTCMinutes() + MX_OFFSET_MIN;
      // Normalizar a 0-1439 en caso de cruzar medianoche
      const normMin = ((mxMinutes % 1440) + 1440) % 1440;

      const hour = Math.floor(normMin / 60);
      const minuteSlot = normMin % 60 < 30 ? 0 : 30;

      if (hour < BIN_START_HOUR || hour >= BIN_END_HOUR) {
        outOfRangeCount++;
        return;
      }

      const binIdx = (hour - BIN_START_HOUR) * 2 + (minuteSlot === 30 ? 1 : 0);
      if (binIdx >= 0 && binIdx < NUM_BINS) {
        const duration = calculateDurationMinutes(startISO, t.finishedAt);
        bins[binIdx].count += 1;
        bins[binIdx].totalDuration += duration;
      }
    });

    const halfHourBins = bins.map((b) => ({
      label: b.label,
      count: b.count,
      avgDuration: b.count > 0 ? Math.round((b.totalDuration / b.count) * 10) / 10 : 0,
    }));

    // ===== 2. Distribución por tipo de atención =====
    const TYPE_LABELS = {
      MuyEspecial: "Muy Especial",
      Prioritario: "Prioritario",
      PrioritarioRiesgo: "Prio + Riesgo",
      RiesgoCaida: "Riesgo de Caída",
      General: "General",
      Special: "Especial (legacy)",
    };

    const typeCounts = {};
    turns.forEach((t) => {
      const key = t.tipoAtencion || "General";
      typeCounts[key] = (typeCounts[key] || 0) + 1;
    });

    const byType = Object.entries(typeCounts)
      .map(([type, count]) => ({
        type,
        label: TYPE_LABELS[type] || type,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // ===== 3. Top flebotomistas por volumen =====
    const phlebCounts = new Map();
    turns.forEach((t) => {
      if (t.user && t.user.id) {
        const key = t.user.id;
        const prev = phlebCounts.get(key) || { name: t.user.name, count: 0 };
        prev.count += 1;
        phlebCounts.set(key, prev);
      }
    });

    const topPhlebotomists = Array.from(phlebCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // ===== 4. KPIs =====
    const totalAttended = turns.length;

    let totalDuration = 0;
    let validDurationCount = 0;
    turns.forEach((t) => {
      const d = calculateDurationMinutes(t.calledAt || t.createdAt, t.finishedAt);
      if (d > 0) {
        totalDuration += d;
        validDurationCount += 1;
      }
    });
    const avgDurationMin =
      validDurationCount > 0
        ? Math.round((totalDuration / validDurationCount) * 10) / 10
        : 0;

    // Hora pico
    let peakHourLabel = "—";
    let peakHourCount = 0;
    halfHourBins.forEach((b) => {
      if (b.count > peakHourCount) {
        peakHourCount = b.count;
        peakHourLabel = b.label;
      }
    });

    // Flebo top
    const topPhleb = topPhlebotomists[0];
    const topPhlebotomistName = topPhleb ? topPhleb.name : "—";
    const topPhlebotomistCount = topPhleb ? topPhleb.count : 0;

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalAttended,
          avgDurationMin,
          peakHourLabel,
          peakHourCount,
          topPhlebotomistName,
          topPhlebotomistCount,
        },
        halfHourBins,
        byType,
        topPhlebotomists,
        outOfRangeCount,
      },
    });
  } catch (error) {
    console.error("[patient-stats/chart-data] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

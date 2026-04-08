import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../../lib/prisma.js";
import { calculateDurationMinutes } from "../../../../../../lib/patientStatsUtils.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

const ALLOWED_ROLES = ["admin", "administrador", "supervisor", "flebotomista"];
const INT4_MAX = 2147483647;
const ALLOWED_BIN_SIZES = [10, 20, 30, 60]; // minutos
const DEFAULT_BIN_SIZE = 30;

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

    // Tamaño del bin en minutos (10, 20, 30, 60). Default 30.
    const requestedBinSize = parseInt(searchParams.get("binSize") || DEFAULT_BIN_SIZE);
    const binSize = ALLOWED_BIN_SIZES.includes(requestedBinSize)
      ? requestedBinSize
      : DEFAULT_BIN_SIZE;

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

    // ===== 1. Bins dinámicos por hora de inicio (calledAt || createdAt) =====
    // Usamos la hora local de México (UTC-6) asumiendo que los timestamps
    // están en UTC. El tamaño del bin viene del parámetro binSize.
    const MX_OFFSET_MIN = -6 * 60; // UTC-6

    // Siempre cubrimos el día completo (1440 min) en bins; después
    // recortamos al rango con datos para no mostrar eternidades vacías.
    const NUM_BINS = Math.floor(1440 / binSize);

    const bins = Array.from({ length: NUM_BINS }, (_, i) => {
      const totalMin = i * binSize;
      const hh = String(Math.floor(totalMin / 60)).padStart(2, "0");
      const mm = String(totalMin % 60).padStart(2, "0");
      return {
        label: `${hh}:${mm}`,
        count: 0,
        totalDuration: 0,
      };
    });

    turns.forEach((t) => {
      const startISO = t.calledAt || t.createdAt;
      if (!startISO) return;

      // Convertir UTC a hora local México
      const utcDate = new Date(startISO);
      const mxMinutes =
        utcDate.getUTCHours() * 60 + utcDate.getUTCMinutes() + MX_OFFSET_MIN;
      // Normalizar a 0-1439 en caso de cruzar medianoche
      const normMin = ((mxMinutes % 1440) + 1440) % 1440;

      const binIdx = Math.floor(normMin / binSize);
      if (binIdx >= 0 && binIdx < NUM_BINS) {
        const duration = calculateDurationMinutes(startISO, t.finishedAt);
        bins[binIdx].count += 1;
        bins[binIdx].totalDuration += duration;
      }
    });

    // Trim: quedarnos con el rango [primer bin con datos, último bin con datos]
    // inclusive. Los bins vacíos INTERIORES se conservan para que el eje X
    // sea continuo y los gaps sean honestos.
    let firstIdx = -1;
    let lastIdx = -1;
    for (let i = 0; i < bins.length; i++) {
      if (bins[i].count > 0) {
        if (firstIdx === -1) firstIdx = i;
        lastIdx = i;
      }
    }

    const trimmedBins =
      firstIdx === -1 ? [] : bins.slice(firstIdx, lastIdx + 1);

    const halfHourBins = trimmedBins.map((b) => ({
      label: b.label,
      count: b.count,
      avgDuration:
        b.count > 0 ? Math.round((b.totalDuration / b.count) * 10) / 10 : 0,
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
        binSize,
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

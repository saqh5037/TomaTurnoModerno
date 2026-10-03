import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateBearer, isAdminOrSupervisorToken } from "@/lib/surveyGateRepo";
import { aggregateSurveyReport } from "@/lib/surveyReport";
import { workDateFor } from "@/lib/surveyGate";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 93;
const DAY_MS = 24 * 60 * 60 * 1000;

// Real calendar date (rejects 2026-02-31, 2026-13-01, ...). Returns UTC ms or null.
function parseDay(s) {
  if (!DATE_RE.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const ms = Date.UTC(y, m - 1, d);
  const back = new Date(ms);
  return back.getUTCFullYear() === y && back.getUTCMonth() === m - 1 && back.getUTCDate() === d ? ms : null;
}

// GET ?from=YYYY-MM-DD&to=YYYY-MM-DD (admin/administrador/supervisor; defaults to today, America/Mexico_City)
export async function GET(request) {
  try {
    const auth = authenticateBearer(request);
    if (auth.error) {
      return NextResponse.json({ success: false, error: auth.error.message }, { status: auth.error.status });
    }
    if (!isAdminOrSupervisorToken(auth.decoded)) {
      return NextResponse.json({ success: false, error: "Acceso denegado" }, { status: 403 });
    }

    const params = new URL(request.url).searchParams;
    const today = workDateFor(new Date());
    const from = params.get("from") || today;
    const to = params.get("to") || from;

    const fromMs = parseDay(from);
    const toMs = parseDay(to);
    if (fromMs === null || toMs === null || fromMs > toMs) {
      return NextResponse.json(
        { success: false, error: "Rango inválido: usa fechas reales from/to en formato YYYY-MM-DD y from <= to" },
        { status: 400 }
      );
    }
    if ((toMs - fromMs) / DAY_MS + 1 > MAX_RANGE_DAYS) {
      return NextResponse.json(
        { success: false, error: `El rango máximo es de ${MAX_RANGE_DAYS} días` },
        { status: 400 }
      );
    }

    // workDate is a YYYY-MM-DD string, so lexicographic comparison is date comparison
    const assignments = await prisma.surveyAssignment.findMany({
      where: { workDate: { gte: from, lte: to } },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { name: true } },
        turn: { select: { patientName: true } }
      }
    });

    const { rows, totals } = aggregateSurveyReport(assignments);
    return NextResponse.json({ success: true, data: { from, to, rows, totals } });
  } catch (error) {
    console.error("[Surveys Report] Error:", error);
    return NextResponse.json({ success: false, error: "Error al generar el reporte" }, { status: 500 });
  }
}

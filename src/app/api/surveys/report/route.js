import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateBearer, isAdminToken } from "@/lib/surveyGateRepo";
import { aggregateSurveyReport } from "@/lib/surveyReport";
import { workDateFor } from "@/lib/surveyGate";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// GET ?from=YYYY-MM-DD&to=YYYY-MM-DD (admin only; defaults to today, America/Mexico_City)
export async function GET(request) {
  try {
    const auth = authenticateBearer(request);
    if (auth.error) {
      return NextResponse.json({ success: false, error: auth.error.message }, { status: auth.error.status });
    }
    if (!isAdminToken(auth.decoded)) {
      return NextResponse.json({ success: false, error: "Acceso denegado" }, { status: 403 });
    }

    const params = new URL(request.url).searchParams;
    const today = workDateFor(new Date());
    const from = params.get("from") || today;
    const to = params.get("to") || from;

    if (!DATE_RE.test(from) || !DATE_RE.test(to) || from > to) {
      return NextResponse.json(
        { success: false, error: "Rango inválido: usa from/to en formato YYYY-MM-DD y from <= to" },
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

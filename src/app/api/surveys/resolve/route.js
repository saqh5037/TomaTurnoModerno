import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateBearer, isAdminToken, writeAudit } from "@/lib/surveyGateRepo";

const fail = (status, error, extra = {}) =>
  NextResponse.json({ success: false, error, ...extra }, { status });

// POST { turnId, outcome: "COMPLETED"|"REFUSED", reason?, iframeLoads? }
export async function POST(request) {
  try {
    const auth = authenticateBearer(request);
    if (auth.error) return fail(auth.error.status, auth.error.message);
    const { decoded } = auth;

    const body = await request.json();
    const turnId = parseInt(body.turnId);
    const { outcome } = body;

    if (!Number.isInteger(turnId)) return fail(400, "turnId es requerido");
    if (outcome !== "COMPLETED" && outcome !== "REFUSED") {
      return fail(400, "outcome debe ser COMPLETED o REFUSED");
    }

    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (outcome === "REFUSED" && reason.length < 3) {
      return fail(400, "Se requiere el motivo de la negativa (mínimo 3 caracteres)");
    }

    let iframeLoads = null;
    if (body.iframeLoads !== undefined && body.iframeLoads !== null) {
      iframeLoads = parseInt(body.iframeLoads);
      if (!Number.isInteger(iframeLoads) || iframeLoads < 0) {
        return fail(400, "iframeLoads debe ser un entero >= 0");
      }
    }

    const assignment = await prisma.surveyAssignment.findUnique({
      where: { turnId },
      include: { turn: { select: { attendedBy: true } } }
    });
    if (!assignment) return fail(404, "El turno no tiene encuesta asignada");

    const isOwner = decoded.userId === assignment.turn.attendedBy || decoded.userId === assignment.userId;
    if (!isOwner && !isAdminToken(decoded)) return fail(403, "Acceso denegado");

    const now = new Date();
    const updated = await prisma.surveyAssignment.updateMany({
      where: { id: assignment.id, status: "PENDING" },
      data: {
        status: outcome,
        refusalReason: outcome === "REFUSED" ? reason : null,
        iframeLoads,
        resolvedAt: now,
        resolvedBy: decoded.userId
      }
    });
    if (updated.count === 0) {
      return fail(409, "La encuesta ya fue resuelta", { code: "SURVEY_NOT_PENDING", status: assignment.status });
    }

    await writeAudit(prisma, {
      request,
      userId: decoded.userId,
      action: outcome === "COMPLETED" ? "SURVEY_COMPLETED" : "SURVEY_REFUSED",
      entity: "SurveyAssignment",
      entityId: assignment.id,
      oldValue: { status: "PENDING" },
      newValue: { status: outcome, turnId, reason: outcome === "REFUSED" ? reason : undefined, iframeLoads }
    });

    return NextResponse.json({
      success: true,
      data: { assignmentId: assignment.id, turnId, status: outcome, resolvedAt: now }
    });
  } catch (error) {
    console.error("[Surveys Resolve] Error:", error);
    return fail(500, "Error al resolver la encuesta");
  }
}

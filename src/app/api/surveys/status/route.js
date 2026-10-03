import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateBearer, getSurveyConfig, publicSurveyConfig } from "@/lib/surveyGateRepo";

// GET ?turnId= -> current assignment for the turn (page reload recovery) + config
export async function GET(request) {
  try {
    const auth = authenticateBearer(request);
    if (auth.error) {
      return NextResponse.json({ success: false, error: auth.error.message }, { status: auth.error.status });
    }

    const turnId = parseInt(new URL(request.url).searchParams.get("turnId"));
    if (!Number.isInteger(turnId)) {
      return NextResponse.json({ success: false, error: "turnId es requerido" }, { status: 400 });
    }

    const config = await getSurveyConfig(prisma);
    const assignment = config.enabled
      ? await prisma.surveyAssignment.findUnique({
          where: { turnId },
          select: { id: true, turnId: true, userId: true, status: true, mode: true, workDate: true, iframeLoads: true, refusalReason: true, resolvedAt: true }
        })
      : null;

    return NextResponse.json({
      success: true,
      data: { assignment, surveyRequired: assignment?.status === "PENDING", surveyConfig: publicSurveyConfig(config) }
    });
  } catch (error) {
    console.error("[Surveys Status] Error:", error);
    return NextResponse.json({ success: false, error: "Error al consultar la encuesta" }, { status: 500 });
  }
}

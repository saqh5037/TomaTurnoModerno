import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  SURVEY_CONFIG_KEY,
  authenticateBearer,
  getSurveyConfig,
  isAdminToken,
  writeAudit
} from "@/lib/surveyGateRepo";
import { validateSurveyConfigUpdate } from "@/lib/surveyGate";

// GET - current effective config (any authenticated user)
export async function GET(request) {
  try {
    const auth = authenticateBearer(request);
    if (auth.error) {
      return NextResponse.json({ success: false, error: auth.error.message }, { status: auth.error.status });
    }
    const config = await getSurveyConfig(prisma);
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("[Survey Config] GET error:", error);
    return NextResponse.json({ success: false, error: "Error al obtener la configuración" }, { status: 500 });
  }
}

// POST - partial update { enabled?, mode?, windowMax?, maxRefusalsPerDay?, url? } (admin only)
export async function POST(request) {
  try {
    const auth = authenticateBearer(request);
    if (auth.error) {
      return NextResponse.json({ success: false, error: auth.error.message }, { status: auth.error.status });
    }
    if (!isAdminToken(auth.decoded)) {
      return NextResponse.json({ success: false, error: "Acceso denegado" }, { status: 403 });
    }

    const body = await request.json();
    const { error, patch } = validateSurveyConfigUpdate(body);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    const oldConfig = await getSurveyConfig(prisma);
    const newConfig = { ...oldConfig, ...patch };
    const now = new Date();
    const userId = auth.decoded.userId;

    await prisma.systemState.upsert({
      where: { key: SURVEY_CONFIG_KEY },
      update: { value: JSON.stringify(newConfig), updatedAt: now, updatedBy: userId },
      create: { key: SURVEY_CONFIG_KEY, value: JSON.stringify(newConfig), updatedAt: now, updatedBy: userId }
    });

    await writeAudit(prisma, {
      request,
      userId,
      action: "SURVEY_CONFIG_UPDATED",
      entity: "SystemState",
      oldValue: oldConfig,
      newValue: newConfig
    });

    return NextResponse.json({ success: true, data: newConfig });
  } catch (error) {
    console.error("[Survey Config] POST error:", error);
    return NextResponse.json({ success: false, error: "Error al guardar la configuración" }, { status: 500 });
  }
}

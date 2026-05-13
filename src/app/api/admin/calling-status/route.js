import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma.js";

// GET - Obtener estado actual de llamados (público para queue displays)
export async function GET() {
  try {
    const state = await prisma.systemState.findUnique({
      where: { key: 'callingPaused' }
    });

    let paused = false;
    let meta = {};

    if (state) {
      try {
        const parsed = JSON.parse(state.value);
        paused = !!parsed.paused;
        meta = parsed;
      } catch (e) {
        paused = false;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        paused,
        ...meta
      }
    });

  } catch (error) {
    console.error("[Calling Status] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener estado" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../../lib/prisma.js";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

// GET - Listar logs fallidos de Labsis
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ success: false, error: "Token inválido" }, { status: 401 });
    }

    const userRole = decodedToken.role?.toLowerCase();
    if (!['admin', 'administrador', 'supervisor'].includes(userRole)) {
      return NextResponse.json({ success: false, error: "Acceso denegado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'FAILED';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [logs, total] = await Promise.all([
      prisma.labsisInboundLog.findMany({
        where: { status },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.labsisInboundLog.count({ where: { status } })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        logs,
        total,
        limit,
        offset
      }
    });

  } catch (error) {
    console.error("[Admin Labsis Reprocess GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al listar logs" },
      { status: 500 }
    );
  }
}

// POST - Reprocesar un log específico
export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ success: false, error: "Token inválido" }, { status: 401 });
    }

    const userRole = decodedToken.role?.toLowerCase();
    if (!['admin', 'administrador', 'supervisor'].includes(userRole)) {
      return NextResponse.json({ success: false, error: "Acceso denegado" }, { status: 403 });
    }

    const body = await request.json();
    const { logId } = body;

    if (!logId) {
      return NextResponse.json(
        { success: false, error: "Se requiere logId" },
        { status: 400 }
      );
    }

    const log = await prisma.labsisInboundLog.findUnique({
      where: { id: parseInt(logId) }
    });

    if (!log) {
      return NextResponse.json(
        { success: false, error: "Log no encontrado" },
        { status: 404 }
      );
    }

    // Reenviar el payload original a /api/turnos para reutilizar toda la lógica de transformación
    const baseUrl = request.headers.get('host') || 'localhost:3006';
    const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
    const turnosUrl = `${protocol}://${baseUrl}/api/turnos`;

    console.log(`[Admin Labsis Reprocess] Reprocesando log ${logId} → ${turnosUrl}`);

    const response = await fetch(turnosUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log.payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Actualizar log con nuevo error
      await prisma.labsisInboundLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          error: JSON.stringify({
            reprocessAttempt: new Date().toISOString(),
            reprocessedBy: decodedToken.userId,
            error: responseData.error || 'Error en reprocesamiento',
            details: responseData.details || responseData.message
          })
        }
      });

      return NextResponse.json({
        success: false,
        error: responseData.error || 'Error al reprocesar turno',
        details: responseData,
        logId: log.id
      }, { status: response.status });
    }

    // Éxito — el endpoint /api/turnos ya actualizó el log a PROCESSED
    await prisma.auditLog.create({
      data: {
        userId: decodedToken.userId,
        action: "ADMIN_REPROCESS_LABSIS",
        entity: "LabsisInboundLog",
        entityId: log.id,
        oldValue: { status: log.status, error: log.error },
        newValue: { status: 'PROCESSED', turnId: responseData.data?.id || null },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    });

    console.log(`[Admin Labsis Reprocess] Log ${logId} reprocesado exitosamente`);

    return NextResponse.json({
      success: true,
      message: "Turno reprocesado exitosamente",
      data: responseData,
      logId: log.id
    });

  } catch (error) {
    console.error("[Admin Labsis Reprocess POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al reprocesar turno" },
      { status: 500 }
    );
  }
}

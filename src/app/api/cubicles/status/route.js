import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Obtener estado de cubículos (ocupados/disponibles)
export async function GET(request) {
  try {
    // Obtener todos los cubículos activos
    const cubicles = await prisma.cubicle.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        isSpecial: true,
        isActive: true,
      },
      orderBy: { name: 'asc' }
    });

    // Obtener usuarios con sesiones activas (última actividad en los últimos 10 minutos)
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    const activeSessions = await prisma.session.findMany({
      where: {
        expiresAt: { gt: now },
        lastActivity: { gte: tenMinutesAgo }
      },
      select: {
        id: true,
        userId: true,
        selectedCubicleId: true,
        lastActivity: true,
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        }
      },
      orderBy: { lastActivity: 'desc' }
    });

    // Rastrear ocupación de cubículos basado en selectedCubicleId de la sesión
    const cubicleOccupancy = {};
    const userLatestSession = {}; // Track latest session per user

    // Primero, encontrar la sesión más reciente de cada usuario
    for (const session of activeSessions) {
      // Solo considerar flebotomistas (no admins ni supervisores)
      const role = session.user.role.toLowerCase();
      if (role !== 'flebotomista') continue;

      // Guardar solo la sesión más reciente de cada usuario
      if (!userLatestSession[session.userId] ||
          new Date(session.lastActivity) > new Date(userLatestSession[session.userId].lastActivity)) {
        userLatestSession[session.userId] = session;
      }
    }

    // Ahora marcar cubículos como ocupados basados en las sesiones más recientes
    for (const userId in userLatestSession) {
      const session = userLatestSession[userId];

      // Si la sesión tiene un cubículo seleccionado, marcarlo como ocupado
      if (session.selectedCubicleId) {
        // Solo marcar como ocupado si no hay otro usuario ya en ese cubículo
        if (!cubicleOccupancy[session.selectedCubicleId]) {
          cubicleOccupancy[session.selectedCubicleId] = {
            userId: session.userId,
            userName: session.user.name,
            userRole: session.user.role,
            lastActivity: session.lastActivity,
            cubicleId: session.selectedCubicleId,
            sessionId: session.id,
            source: 'session_selection'
          };
        }
      }
    }

    // Enriquecer cubículos con información de ocupación
    const enrichedCubicles = cubicles.map(cubicle => {
      const occupation = cubicleOccupancy[cubicle.id];
      return {
        ...cubicle,
        isOccupied: !!occupation,
        occupiedBy: occupation ? {
          userId: occupation.userId,
          userName: occupation.userName,
          userRole: occupation.userRole,
          lastActivity: occupation.lastActivity
        } : null
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedCubicles
    });

  } catch (error) {
    console.error("Error al obtener estado de cubículos:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener estado de cubículos" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

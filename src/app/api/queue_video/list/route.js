// src/app/api/queue_video/list/route.js
import prisma from '../../../../../lib/prisma.js';

export async function GET() {
  try {
    // Obtener turnos pendientes
    const pendingTurns = await prisma.turnRequest.findMany({
      where: {
        status: 'Pending',
        isCalled: false, // Solo los pendientes que NO están siendo llamados
      },
      orderBy: {
        assignedTurn: 'asc',
      },
      select: {
        id: true,
        patientName: true,
        assignedTurn: true,
        status: true,
        createdAt: true,
        cubicle: { select: { name: true } },
        user: { select: { name: true } }
      },
    });

    // Obtener turnos en progreso
    const inProgressTurns = await prisma.turnRequest.findMany({
      where: {
        status: 'In Progress',
      },
      orderBy: {
        assignedTurn: 'asc',
      },
      select: {
        id: true,
        patientName: true,
        assignedTurn: true,
        status: true,
        createdAt: true,
        cubicle: { select: { name: true } },
        user: { select: { name: true } }
      },
    });

    // Turnos que están en estado 'Calling' (status: 'In Progress', isCalled: false)
    const inCallingTurns = await prisma.turnRequest.findMany({
      where: {
        status: 'In Progress',
        isCalled: false, // Recién llamados, esperando anuncio
      },
      orderBy: {
        assignedTurn: 'asc',
      },
      select: {
        id: true,
        patientName: true,
        assignedTurn: true,
        cubicle: { select: { name: true } },
      },
      take: 1, // Solo necesitamos el primero para el anuncio
    });

    return new Response(JSON.stringify({ pendingTurns, inProgressTurns, inCallingTurns }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching queue data for video screen:", error);
    return new Response(JSON.stringify({ error: "Error al cargar los turnos." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
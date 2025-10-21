import prisma from '@/lib/prisma';

/**
 * GET /api/queue/phlebotomists-order
 * Muestra el orden actual de flebotomistas logueados (para debugging)
 */
export async function GET(req) {
  try {
    const activeSessionTime = new Date(Date.now() - 30 * 60 * 1000);

    const activeSessions = await prisma.session.findMany({
      where: {
        lastActivity: {
          gte: activeSessionTime
        },
        expiresAt: {
          gte: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            status: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'  // Ordenar por fecha de creación (login más antiguo primero)
      }
    });

    // Filtrar solo flebotomistas activos
    const activePhlebotomists = activeSessions
      .filter(session =>
        session.user.role === 'Flebotomista' &&
        session.user.status === 'ACTIVE'
      )
      .map((session, index) => ({
        order: index + 1,
        userId: session.user.id,
        name: session.user.name,
        username: session.user.username,
        loginTime: session.createdAt,
        lastActivity: session.lastActivity,
        minutesSinceLogin: Math.floor((Date.now() - new Date(session.createdAt).getTime()) / (1000 * 60))
      }));

    // Obtener cuántos pacientes tiene asignado cada uno
    const phlebotomistsWithPatients = await Promise.all(
      activePhlebotomists.map(async (phlebotomist) => {
        const suggestedPatients = await prisma.turnRequest.count({
          where: {
            suggestedFor: phlebotomist.userId,
            status: 'Pending'
          }
        });

        const patientsInAttention = await prisma.turnRequest.count({
          where: {
            attendedBy: phlebotomist.userId,
            status: { in: ['CALLED', 'IN_ATTENTION'] }
          }
        });

        return {
          ...phlebotomist,
          suggestedPatients,
          patientsInAttention
        };
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        totalActive: activePhlebotomists.length,
        phlebotomists: phlebotomistsWithPatients,
        message: `${activePhlebotomists.length} flebotomistas activos ordenados por tiempo de login`
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error al obtener orden de flebotomistas:", error);
    return new Response(
      JSON.stringify({
        error: "Error al procesar la solicitud",
        details: error.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

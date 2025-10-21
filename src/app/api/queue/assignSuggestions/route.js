import prisma from '@/lib/prisma';

/**
 * POST /api/queue/assignSuggestions
 * Asigna automáticamente pacientes pendientes a flebotomistas activos
 * de manera equitativa para evitar que todos vean el mismo paciente sugerido
 */
export async function POST(req) {
  try {
    const SUGGESTION_TIMEOUT_MINUTES = 5; // Timeout de 5 minutos para liberar sugerencias

    // 1. Liberar sugerencias expiradas (más de 5 minutos sin atender)
    const timeoutDate = new Date(Date.now() - SUGGESTION_TIMEOUT_MINUTES * 60 * 1000);

    await prisma.turnRequest.updateMany({
      where: {
        status: 'Pending',
        suggestedAt: {
          lt: timeoutDate
        },
        suggestedFor: {
          not: null
        }
      },
      data: {
        suggestedFor: null,
        suggestedAt: null
      }
    });

    // 2. Obtener flebotomistas activos (con sesión activa en las últimas 30 minutos)
    // ORDENADOS POR ORDEN DE LOGIN (createdAt de la sesión)
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
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'  // ORDENAR POR FECHA DE CREACIÓN (login más antiguo primero)
      }
    });

    // Filtrar solo flebotomistas activos, manteniendo el orden de login
    const activePhlebotomists = activeSessions
      .filter(session =>
        session.user.role === 'Flebotomista' &&
        session.user.status === 'ACTIVE'
      )
      .map(session => ({
        ...session.user,
        sessionCreatedAt: session.createdAt  // Guardar fecha de login para referencia
      }));

    if (activePhlebotomists.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No hay flebotomistas activos",
          assigned: 0
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Obtener pacientes pendientes sin sugerencia asignada
    // Ordenar: Especiales primero, luego diferidos, luego por turno
    const availablePatients = await prisma.turnRequest.findMany({
      where: {
        status: 'Pending',
        suggestedFor: null
      },
      orderBy: [
        { tipoAtencion: 'desc' },  // Special primero
        { isDeferred: 'desc' },    // Diferidos después
        { assignedTurn: 'asc' }    // Por orden de turno
      ],
      select: {
        id: true,
        patientName: true,
        assignedTurn: true,
        tipoAtencion: true,
        isDeferred: true
      }
    });

    if (availablePatients.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No hay pacientes disponibles para asignar",
          assigned: 0
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Asignar pacientes a flebotomistas de manera round-robin
    const assignments = [];
    const patientsToAssign = Math.min(availablePatients.length, activePhlebotomists.length);

    for (let i = 0; i < patientsToAssign; i++) {
      const patient = availablePatients[i];
      const phlebotomist = activePhlebotomists[i];

      await prisma.turnRequest.update({
        where: { id: patient.id },
        data: {
          suggestedFor: phlebotomist.id,
          suggestedAt: new Date()
        }
      });

      assignments.push({
        patientId: patient.id,
        patientName: patient.patientName,
        turnNumber: patient.assignedTurn,
        assignedTo: phlebotomist.name,
        phlebotomistId: phlebotomist.id,
        loginOrder: i + 1,  // Orden de login del flebotomista
        sessionCreatedAt: phlebotomist.sessionCreatedAt
      });
    }

    console.log(`✅ ${assignments.length} pacientes asignados automáticamente (por orden de login)`);
    assignments.forEach((a, index) => {
      console.log(`   Flebotomista #${index + 1} (${a.assignedTo}) → Turno #${a.turnNumber} (${a.patientName})`);
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `${assignments.length} pacientes asignados`,
        assigned: assignments.length,
        activePhlebotomists: activePhlebotomists.length,
        availablePatients: availablePatients.length,
        assignments: assignments
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error al asignar sugerencias:", error);
    return new Response(
      JSON.stringify({
        error: "Error al procesar la solicitud",
        details: error.message
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

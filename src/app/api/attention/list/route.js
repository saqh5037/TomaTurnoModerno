import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    // Obtener userId de los query params (opcional, para filtrar sugerencias)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Consulta para turnos pendientes
    // Ordenamiento: Por "tiempo efectivo de cola" = COALESCE(deferredAt, createdAt)
    // Esto asegura que:
    // - Pacientes no diferidos se ordenan por createdAt
    // - Pacientes diferidos se ordenan por deferredAt (que se setea al final de la cola al diferir)
    // - Nuevos pacientes creados después de un diferimiento aparecen según su createdAt
    const pendingTurns = await prisma.$queryRaw`
      SELECT
        id,
        "patientName",
        age,
        gender,
        "contactInfo",
        studies,
        "assignedTurn",
        "tipoAtencion",
        "isDeferred",
        "callCount",
        "suggestedFor",
        "suggestedAt",
        "createdAt",
        "deferredAt",
        "tubesRequired",
        "tubesDetails",
        observations,
        "clinicalInfo"
      FROM "TurnRequest"
      WHERE status = 'Pending'
      ORDER BY
        CASE WHEN "tipoAtencion" = 'Special' THEN 0 ELSE 1 END,
        COALESCE("deferredAt", "createdAt") ASC
    `;

    // Consulta para turnos en progreso
    const inProgressTurns = await prisma.turnRequest.findMany({
      where: { status: "In Progress" },
      select: {
        id: true,
        patientName: true,
        age: true,
        gender: true,
        contactInfo: true,
        studies: true,
        assignedTurn: true,
        tipoAtencion: true,
        isCalled: true,
        isDeferred: true,
        callCount: true,
        tubesRequired: true,
        tubesDetails: true,
        observations: true,
        clinicalInfo: true,
        cubicle: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { isDeferred: 'desc' },
        { assignedTurn: 'asc' }
      ]
    });

    // El ordenamiento ya está hecho por Prisma (tipoAtencion DESC, updatedAt ASC)
    // NO re-ordenar aquí para evitar que la cola "rote" en cada refresh
    // El orden debe ser estático y solo cambiar cuando haya acciones reales (llamar, diferir, nuevo)
    const sortedPendingTurns = pendingTurns;

    // Respuesta con los datos
    return new Response(
      JSON.stringify({
        pendingTurns: sortedPendingTurns.map((turn) => ({
          id: turn.id,
          patientName: turn.patientName,
          age: turn.age,
          gender: turn.gender,
          contactInfo: turn.contactInfo,
          studies: turn.studies,
          assignedTurn: turn.assignedTurn,
          isSpecial: turn.tipoAtencion === "Special",
          isDeferred: turn.isDeferred,
          callCount: turn.callCount,
          isSuggestedForMe: userId ? turn.suggestedFor === parseInt(userId) : false,
          suggestedFor: turn.suggestedFor,
          tubesRequired: turn.tubesRequired,
          tubesDetails: turn.tubesDetails,
          observations: turn.observations,
          clinicalInfo: turn.clinicalInfo,
        })),
        inProgressTurns: inProgressTurns.map((turn) => ({
          id: turn.id,
          patientName: turn.patientName,
          age: turn.age,
          gender: turn.gender,
          contactInfo: turn.contactInfo,
          studies: turn.studies,
          assignedTurn: turn.assignedTurn,
          isSpecial: turn.tipoAtencion === "Special",
          isCalled: turn.isCalled,
          isDeferred: turn.isDeferred,
          callCount: turn.callCount,
          cubicleName: turn.cubicle?.name || "Sin cubículo",
          flebotomistName: turn.user?.name || "Sin flebotomista",
          tubesRequired: turn.tubesRequired,
          tubesDetails: turn.tubesDetails,
          observations: turn.observations,
          clinicalInfo: turn.clinicalInfo,
        })),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en /api/attention/list:", error);

    // Manejo de errores
    return new Response(
      JSON.stringify({ error: "Error al obtener los turnos" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

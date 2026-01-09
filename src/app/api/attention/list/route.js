import prisma from "@/lib/prisma";
import { releaseExpiredHoldings } from "@/lib/holdingUtils";

export async function GET(request) {
  try {
    // Obtener userId de los query params (para filtrar holdings de otros usuarios)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userIdNum = userId ? parseInt(userId, 10) : null;

    // Limpiar holdings expirados antes de listar
    await releaseExpiredHoldings();

    // Consulta para turnos pendientes
    // Filtra turnos en holding de OTROS usuarios (solo muestra los propios o sin holding)
    // Ordenamiento: Por prioridad (Special primero), luego por tiempo efectivo de cola
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
        "holdingBy",
        "holdingAt",
        "createdAt",
        "deferredAt",
        "tubesRequired",
        "tubesDetails",
        observations,
        "clinicalInfo",
        patient_id as "patientID",
        work_order as "workOrder"
      FROM "TurnRequest"
      WHERE status = 'Pending'
        AND ("holdingBy" IS NULL OR "holdingBy" = ${userIdNum})
      ORDER BY
        CASE WHEN "tipoAtencion" = 'Special' THEN 0 ELSE 1 END,
        "isDeferred" ASC,
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
        patientID: true,  // CI/Expediente del paciente
        workOrder: true,  // Número de orden de trabajo
        attendedBy: true, // Para identificar quién está atendiendo
        cubicleId: true, // Para restaurar el cubículo
        cubicle: {
          select: {
            id: true,
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
          // Campos de holding (nuevo sistema)
          isHeldByMe: userIdNum ? turn.holdingBy === userIdNum : false,
          holdingBy: turn.holdingBy,
          // Campos de sugerencia (deprecated, mantener para compatibilidad)
          isSuggestedForMe: userIdNum ? turn.suggestedFor === userIdNum : false,
          suggestedFor: turn.suggestedFor,
          tubesRequired: turn.tubesRequired,
          tubesDetails: turn.tubesDetails,
          observations: turn.observations,
          clinicalInfo: turn.clinicalInfo,
          patientID: turn.patientID,
          workOrder: turn.workOrder,
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
          cubicleId: turn.cubicleId,
          cubicle: turn.cubicle,
          flebotomistName: turn.user?.name || "Sin flebotomista",
          attendedBy: turn.attendedBy, // Para identificar el paciente del usuario actual
          tubesRequired: turn.tubesRequired,
          tubesDetails: turn.tubesDetails,
          observations: turn.observations,
          clinicalInfo: turn.clinicalInfo,
          patientID: turn.patientID,
          workOrder: turn.workOrder,
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

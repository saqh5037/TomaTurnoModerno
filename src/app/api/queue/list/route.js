import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    // Pacientes en Espera
    // Ordenamiento: Por "tiempo efectivo de cola" = COALESCE(deferredAt, createdAt)
    // Esto asegura que:
    // - Pacientes no diferidos se ordenan por createdAt
    // - Pacientes diferidos se ordenan por deferredAt (que se setea al final de la cola)
    // - Nuevos pacientes creados después de un diferimiento aparecen según su createdAt
    const pendingTurns = await prisma.$queryRaw`
      SELECT
        id,
        "patientName",
        "assignedTurn",
        "tipoAtencion",
        "isDeferred",
        "callCount"
      FROM "TurnRequest"
      WHERE status = 'Pending'
      ORDER BY
        CASE WHEN "tipoAtencion" = 'Special' THEN 0 ELSE 1 END,
        COALESCE("deferredAt", "createdAt") ASC
    `;

    // Pacientes en Llamado
    const inCallingTurns = await prisma.$queryRaw`
      SELECT
        t.id,
        t."patientName",
        t."assignedTurn",
        t."tipoAtencion",
        t."isDeferred",
        t."callCount",
        c.name as "cubicleName"
      FROM "TurnRequest" t
      LEFT JOIN "Cubicle" c ON t."cubicleId" = c.id
      WHERE t.status = 'In Progress' AND t."isCalled" = false
      ORDER BY
        CASE WHEN t."tipoAtencion" = 'Special' THEN 0 ELSE 1 END,
        COALESCE(t."deferredAt", t."createdAt") ASC
    `;

    // Pacientes en Atención
    const inProgressTurns = await prisma.$queryRaw`
      SELECT
        t.id,
        t."patientName",
        t."assignedTurn",
        t."tipoAtencion",
        t."isDeferred",
        t."callCount",
        c.name as "cubicleName"
      FROM "TurnRequest" t
      LEFT JOIN "Cubicle" c ON t."cubicleId" = c.id
      WHERE t.status = 'In Progress' AND t."isCalled" = true
      ORDER BY
        CASE WHEN t."tipoAtencion" = 'Special' THEN 0 ELSE 1 END,
        COALESCE(t."deferredAt", t."createdAt") ASC
    `;

    return new Response(
      JSON.stringify({ pendingTurns, inCallingTurns, inProgressTurns }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error en /api/queue/list:", error);
    return new Response(JSON.stringify({ error: "Error al obtener los turnos" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

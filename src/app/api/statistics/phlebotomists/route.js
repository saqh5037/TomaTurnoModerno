import prisma from '../../../../../lib/prisma.js';

export async function POST(req) {
  try {
    const { year, month, phlebotomistId } = await req.json();

    // Validar parámetros
    if (!year || !month || !phlebotomistId) {
      return new Response(
        JSON.stringify({ error: "Faltan parámetros de filtro." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Construir rango de fechas
    const startDate = new Date(year, month - 1, 1); // Primer día del mes
    const endDate = new Date(year, month, 0, 23, 59, 59); // Último día del mes

    // Consultar datos agrupados por día (normalizando la fecha)
    const turnRequests = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") AS "day",
        COUNT(*)::INT AS "count" -- Convertir a INT explícitamente
      FROM "TurnRequest"
      WHERE "attendedBy" = ${parseInt(phlebotomistId)}
        AND "status" = 'Completed'
        AND "createdAt" BETWEEN ${startDate} AND ${endDate}
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt");
    `;

    // Formatear datos para enviar al frontend
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const matchingRequest = turnRequests.find(
        (request) => new Date(request.day).getDate() === day
      );
      return { day, count: matchingRequest ? Number(matchingRequest.count) : 0 };
    });

    // Total de turnos atendidos
    const total = dailyData.reduce((sum, { count }) => sum + count, 0);

    return new Response(
      JSON.stringify({
        dailyData,
        total,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en la API de flebotomistas:", error);
    return new Response("Error interno del servidor", { status: 500 });
  }
}

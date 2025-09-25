import prisma from '../../../../../lib/prisma.js';

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export async function POST(req) {
  try {
    const { year, phlebotomistId } = await req.json();

    const filters = {};
    if (year) {
      filters.createdAt = {
        gte: new Date(year, 0, 1),
        lte: new Date(year, 11, 31),
      };
    }
    if (phlebotomistId && phlebotomistId !== "all") {
      filters.attendedBy = phlebotomistId;
    }

    // Obtener datos agrupados por mes usando finishedAt para turnos atendidos
    const data = await prisma.turnRequest.findMany({
      where: {
        status: "Attended",
        finishedAt: filters.createdAt ? {
          gte: filters.createdAt.gte,
          lte: filters.createdAt.lte,
        } : undefined,
        attendedBy: filters.attendedBy,
      },
      select: {
        finishedAt: true,
      },
    });

    // Calcular totales por mes usando finishedAt
    const monthlyData = data.reduce((acc, item) => {
      if (item.finishedAt) {
        const date = new Date(item.finishedAt);
        const month = monthNames[date.getMonth()]; // Traducir el mes al nombre
        acc[month] = (acc[month] || 0) + 1;
      }
      return acc;
    }, {});

    // Calcular el total general
    const totalPatients = Object.values(monthlyData).reduce((sum, count) => sum + count, 0);

    // Formatear respuesta con totales
    const response = {
      monthlyData,
      total: totalPatients,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching monthly statistics:", error);
    return new Response("Error fetching monthly statistics", { status: 500 });
  }
}

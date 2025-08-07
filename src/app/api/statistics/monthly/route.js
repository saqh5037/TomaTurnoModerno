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

    // Obtener datos agrupados por mes
    const data = await prisma.turnRequest.groupBy({
      by: ["createdAt"],
      where: {
        status: "Completed",
        ...filters,
      },
      _count: {
        id: true,
      },
    });

    // Calcular totales por mes
    const monthlyData = data.reduce((acc, item) => {
      const date = new Date(item.createdAt);
      const month = monthNames[date.getMonth()]; // Traducir el mes al nombre
      acc[month] = (acc[month] || 0) + item._count.id;
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

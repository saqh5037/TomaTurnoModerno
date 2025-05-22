import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { year, month } = await req.json();

    const filters = {};
    if (year) {
      filters.createdAt = {
        gte: new Date(year, month ? month - 1 : 0, 1),
        lt: new Date(year, month ? month : 12, 1),
      };
    }

    const data = await prisma.turnRequest.groupBy({
      by: ["createdAt"],
      where: {
        status: "Attended",
        ...filters,
      },
      _count: {
        id: true,
      },
    });

    // Agrupar por días del mes
    const dailyData = data.reduce((acc, item) => {
      const date = new Date(item.createdAt);
      const day = date.getDate();
      acc[day] = (acc[day] || 0) + item._count.id;
      return acc;
    }, {});

    // Calcular el total general
    const totalPatients = Object.values(dailyData).reduce((sum, count) => sum + count, 0);

    return new Response(
      JSON.stringify({
        dailyData,
        total: totalPatients,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching daily statistics:", error);
    return new Response("Error fetching daily statistics", { status: 500 });
  }
}

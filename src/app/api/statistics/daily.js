import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const dailyStats = await prisma.turn.groupBy({
      by: ["createdAt"],
      _count: {
        id: true,
      },
      where: {
        status: "Completed",
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.status(200).json(dailyStats);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estadísticas diarias", details: error.message });
  }
}

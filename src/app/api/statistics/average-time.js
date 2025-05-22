import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const averageTimeStats = await prisma.turn.groupBy({
      by: ["phlebotomistId"],
      _avg: {
        duration: true,
      },
      where: {
        status: "Completed",
      },
    });

    res.status(200).json(averageTimeStats);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tiempos promedio", details: error.message });
  }
}

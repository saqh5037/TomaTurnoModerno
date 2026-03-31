import prisma from '../../../../../../lib/prisma.js';

export async function GET() {
  try {
    // Obtener usuarios con rol flebotomista (case-insensitive: "Flebotomista" y "flebotomista")
    const phlebotomists = await prisma.user.findMany({
      where: {
        role: { in: ["Flebotomista", "flebotomista"] }
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return new Response(JSON.stringify(phlebotomists), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener los flebotomistas:", error);
    return new Response("Error interno del servidor", { status: 500 });
  }
}

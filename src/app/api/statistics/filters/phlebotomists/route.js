import prisma from '../../../../../../lib/prisma.js';

export async function GET() {
  try {
    // Obtener usuarios con el rol "Flebotomista"
    const phlebotomists = await prisma.user.findMany({
      where: { role: "Flebotomista" }, // Usando el rol correcto
      select: { id: true, name: true }, // Devolver solo id y nombre
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

// pages/api/cubicles/route.js

import prisma from '@/lib/prisma';

// Obtener lista de cubículos
export const GET = async () => {
  try {
    const cubicles = await prisma.cubicle.findMany();
    return new Response(JSON.stringify(cubicles), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al obtener los cubículos' }), { status: 500 });
  }
};

// Crear un nuevo cubículo
export const POST = async (req) => {
  const { name, isSpecial } = await req.json();

  try {
    // Establece el tipo de cubículo automáticamente
    const newCubicle = await prisma.cubicle.create({
      data: {
        name,
        isSpecial,
        type: isSpecial ? 'SPECIAL' : 'GENERAL', // Asignación condicional para tipo
      },
    });
    return new Response(JSON.stringify(newCubicle), { status: 201 });
  } catch (error) {
    console.error('Error al crear el cubículo:', error); // Log detallado
    return new Response(JSON.stringify({ error: 'Error al crear el cubículo' }), { status: 500 });
  }
};

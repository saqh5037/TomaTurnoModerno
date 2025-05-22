import prisma from '@/lib/prisma';

// Modificar un cubículo por ID
export const PUT = async (req, context) => {
  const { id } = await context.params;
  const { name, isSpecial } = await req.json();

  try {
    const updatedCubicle = await prisma.cubicle.update({
      where: { id: parseInt(id) },
      data: { name, isSpecial },
    });
    return new Response(JSON.stringify(updatedCubicle), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al modificar el cubículo' }), { status: 500 });
  }
};

// Eliminar un cubículo por ID
export const DELETE = async (req, context) => {
  const { id } = await context.params;

  try {
    await prisma.cubicle.delete({
      where: { id: parseInt(id) },
    });
    return new Response(JSON.stringify({ message: 'Cubículo eliminado' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al eliminar el cubículo' }), { status: 500 });
  }
};

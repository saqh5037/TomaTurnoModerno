import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

// Modificar un usuario por ID
export const PUT = async (req, context) => {
  const { id } = await context.params;
  const { username, password, name, role } = await req.json();

  try {
    // Encriptar la contraseña solo si se proporciona una nueva contraseña
    const data = {
      username,
      name,
      role,
    };
    if (password) {
      data.password = await bcrypt.hash(password, 10); // Encriptar la nueva contraseña
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data,
    });
    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al modificar el usuario' }), { status: 500 });
  }
};

// Eliminar un usuario por ID
export const DELETE = async (req, context) => {
  const { id } = await context.params;

  try {
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    return new Response(JSON.stringify({ message: 'Usuario eliminado' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al eliminar el usuario' }), { status: 500 });
  }
};

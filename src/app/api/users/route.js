import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

// Obtener lista de usuarios
export const GET = async () => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, name: true, role: true, createdAt: true },
    });
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al obtener los usuarios' }), { status: 500 });
  }
};

// Crear un nuevo usuario
export const POST = async (req) => {
  const { username, password, name, role } = await req.json();

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Encriptar la contraseña
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role,
      },
    });
    return new Response(JSON.stringify(newUser), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al crear el usuario' }), { status: 500 });
  }
};

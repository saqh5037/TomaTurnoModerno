import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const { username, password, name, role } = await req.json();

  if (!username || !password || !name || !role) {
    return new Response(JSON.stringify({ error: 'Todos los campos son obligatorios' }), { status: 400 });
  }

  try {
    // Verifica si el usuario ya existe (case-insensitive)
    const existingUser = await prisma.user.findFirst({
      where: { 
        username: {
          equals: username,
          mode: 'insensitive'
        }
      },
    });

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'El nombre de usuario ya está en uso' }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Guarda el username en minúsculas para mantener consistencia
    await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        password: hashedPassword,
        name,
        role,
      },
    });

    // Respuesta simple para verificar si el error persiste
    return new Response(JSON.stringify({ message: 'Usuario creado exitosamente' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en el servidor:', error); // Log detallado del error
    return new Response(JSON.stringify({ error: 'Error al crear el usuario' }), { status: 500 });
  }
}

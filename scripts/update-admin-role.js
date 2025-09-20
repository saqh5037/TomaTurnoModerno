const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdminRole() {
  try {
    console.log('Actualizando rol del usuario admin...');

    // Buscar el usuario admin
    const adminUser = await prisma.user.findFirst({
      where: { username: 'admin' }
    });

    if (!adminUser) {
      console.error('Usuario admin no encontrado');
      return;
    }

    console.log('Usuario actual:', {
      id: adminUser.id,
      username: adminUser.username,
      name: adminUser.name,
      role: adminUser.role
    });

    // Actualizar el rol a 'admin'
    const updatedUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        role: 'admin',
        isActive: true
      }
    });

    console.log('✅ Rol actualizado exitosamente:', {
      id: updatedUser.id,
      username: updatedUser.username,
      name: updatedUser.name,
      role: updatedUser.role
    });

  } catch (error) {
    console.error('Error actualizando el rol:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminRole();
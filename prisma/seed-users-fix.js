const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Actualizando usuarios existentes con nuevos campos...');

  try {
    // Actualizar usuarios existentes con campos faltantes
    const existingUsers = await prisma.user.findMany();
    console.log(`📋 Usuarios existentes encontrados: ${existingUsers.length}`);

    for (const user of existingUsers) {
      console.log(`Actualizando usuario: ${user.username}`);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email || `${user.username}@hospital.com`,
          phone: user.phone || null,
          isActive: true,
          lastLogin: user.role === 'admin' ? new Date() : null,
          passwordChangedAt: new Date('2025-01-01'),
          failedAttempts: 0,
          lockedUntil: null,
          updatedAt: new Date()
        }
      });
    }

    // Verificar que los usuarios principales existan
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (!adminUser) {
      console.log('✨ Creando usuario admin...');
      const hashedPassword = await bcrypt.hash('Admin2025!', 10);

      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          name: 'Administrador del Sistema',
          role: 'admin',
          email: 'admin@hospital.com',
          phone: '555-0001',
          isActive: true,
          lastLogin: new Date(),
          passwordChangedAt: new Date(),
          failedAttempts: 0
        }
      });
    }

    // Crear algunos usuarios de prueba adicionales si no existen muchos
    const userCount = await prisma.user.count();

    if (userCount < 10) {
      console.log('✨ Creando usuarios de prueba adicionales...');

      const testUsers = [
        {
          username: 'supervisor1',
          password: await bcrypt.hash('Super2025!', 10),
          name: 'Ana Martínez Supervisor',
          role: 'supervisor',
          email: 'ana.martinez@hospital.com',
          phone: '555-0010',
          isActive: true,
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
        },
        {
          username: 'flebotomista2',
          password: await bcrypt.hash('Flebo2025!', 10),
          name: 'Carlos Rodríguez',
          role: 'flebotomista',
          email: 'carlos.rodriguez@hospital.com',
          phone: '555-0011',
          isActive: true,
          lastLogin: new Date(Date.now() - 30 * 60 * 1000), // Hace 30 minutos
        },
        {
          username: 'flebotomista3',
          password: await bcrypt.hash('Flebo2025!', 10),
          name: 'Laura Sánchez',
          role: 'flebotomista',
          email: 'laura.sanchez@hospital.com',
          phone: '555-0012',
          isActive: true,
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hace 1 día
        },
        {
          username: 'flebotomista4',
          password: await bcrypt.hash('Flebo2025!', 10),
          name: 'Roberto Jiménez',
          role: 'flebotomista',
          email: 'roberto.jimenez@hospital.com',
          phone: '555-0013',
          isActive: false, // Usuario inactivo
          lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Hace 7 días
        },
        {
          username: 'recepcion1',
          password: await bcrypt.hash('Recep2025!', 10),
          name: 'Patricia Gómez',
          role: 'recepcion',
          email: 'patricia.gomez@hospital.com',
          phone: '555-0014',
          isActive: true,
          lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000), // Hace 1 hora
        },
        {
          username: 'laboratorio1',
          password: await bcrypt.hash('Lab2025!', 10),
          name: 'Dr. Miguel Torres',
          role: 'laboratorio',
          email: 'miguel.torres@hospital.com',
          phone: '555-0015',
          isActive: true,
          lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000), // Hace 3 horas
        }
      ];

      for (const userData of testUsers) {
        const existingUser = await prisma.user.findUnique({
          where: { username: userData.username }
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              ...userData,
              passwordChangedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Hace 30 días
              failedAttempts: 0
            }
          });
          console.log(`✅ Usuario creado: ${userData.username}`);
        } else {
          console.log(`⚠️ Usuario ya existe: ${userData.username}`);
        }
      }
    }

    // Crear algunos registros de auditoría de ejemplo
    console.log('📝 Creando registros de auditoría de ejemplo...');

    const adminId = (await prisma.user.findUnique({ where: { username: 'admin' } }))?.id;

    if (adminId) {
      const auditLogs = [
        {
          userId: adminId,
          action: 'LOGIN',
          entity: 'User',
          entityId: adminId,
          ipAddress: '192.168.1.100',
          createdAt: new Date()
        },
        {
          userId: adminId,
          action: 'CREATE',
          entity: 'User',
          entityId: adminId,
          newValue: { username: 'newuser', role: 'flebotomista' },
          ipAddress: '192.168.1.100',
          createdAt: new Date(Date.now() - 60 * 60 * 1000) // Hace 1 hora
        },
        {
          userId: adminId,
          action: 'UPDATE',
          entity: 'User',
          entityId: adminId,
          oldValue: { isActive: false },
          newValue: { isActive: true },
          ipAddress: '192.168.1.100',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // Hace 2 horas
        }
      ];

      for (const log of auditLogs) {
        await prisma.auditLog.create({ data: log });
      }
    }

    // Crear algunas sesiones activas de ejemplo
    console.log('🔑 Creando sesiones activas de ejemplo...');

    const activeUsers = await prisma.user.findMany({
      where: { isActive: true },
      take: 3
    });

    for (const user of activeUsers) {
      // Verificar si ya tiene una sesión activa
      const existingSession = await prisma.session.findFirst({
        where: {
          userId: user.id,
          expiresAt: { gt: new Date() }
        }
      });

      if (!existingSession) {
        await prisma.session.create({
          data: {
            userId: user.id,
            token: `token_${user.username}_${Date.now()}`,
            ipAddress: `192.168.1.${100 + user.id}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expira en 24 horas
          }
        });
      }
    }

    // Mostrar resumen final
    const finalUserCount = await prisma.user.count();
    const activeCount = await prisma.user.count({ where: { isActive: true } });
    const sessionCount = await prisma.session.count({ where: { expiresAt: { gt: new Date() } } });
    const auditCount = await prisma.auditLog.count();

    console.log('\n📊 Resumen de la base de datos:');
    console.log(`   Total de usuarios: ${finalUserCount}`);
    console.log(`   Usuarios activos: ${activeCount}`);
    console.log(`   Sesiones activas: ${sessionCount}`);
    console.log(`   Registros de auditoría: ${auditCount}`);

    // Listar todos los usuarios
    console.log('\n👥 Usuarios en el sistema:');
    const allUsers = await prisma.user.findMany({
      select: {
        username: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true
      },
      orderBy: { role: 'asc' }
    });

    for (const user of allUsers) {
      const status = user.isActive ? '✅' : '❌';
      const lastLogin = user.lastLogin
        ? new Date(user.lastLogin).toLocaleString('es-MX')
        : 'Nunca';
      console.log(`   ${status} ${user.username} (${user.role}) - ${user.name} - Último acceso: ${lastLogin}`);
    }

    console.log('\n✨ Seed completado exitosamente!');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
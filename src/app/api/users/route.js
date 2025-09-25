import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// GET - Obtener todos los usuarios con datos extendidos
export async function GET(request) {
  try {
    // Verificar autorización
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decodedToken;

    try {
      decodedToken = jwt.verify(token, process.env.NEXTAUTH_SECRET || "your-secret-key");
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Token inválido" },
        { status: 401 }
      );
    }

    // Verificar que el usuario sea admin
    const requestingUser = await prisma.user.findUnique({
      where: { id: decodedToken.userId }
    });

    // Aceptar tanto 'admin' como 'Administrador' para compatibilidad
    const isAdmin = requestingUser && (
      requestingUser.role === 'Administrador' ||
      requestingUser.role === 'admin' ||
      requestingUser.role.toLowerCase() === 'admin'
    );

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Acceso denegado. Se requieren permisos de administrador." },
        { status: 403 }
      );
    }

    // Obtener todos los usuarios con información extendida
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        email: true,
        phone: true,
        isActive: true,
        lastLogin: true,
        passwordChangedAt: true,
        failedAttempts: true,
        lockedUntil: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sessions: {
              where: {
                expiresAt: { gt: new Date() }
              }
            },
            turnRequests: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { role: 'asc' },
        { name: 'asc' }
      ]
    });

    // Agregar información adicional a cada usuario
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      // Obtener sesiones activas
      const activeSessions = await prisma.session.count({
        where: {
          userId: user.id,
          expiresAt: { gt: new Date() }
        }
      });

      // Calcular tiempo desde último acceso
      let lastLoginStatus = 'Nunca';
      let lastLoginColor = 'gray';

      if (user.lastLogin) {
        const hoursSinceLogin = Math.floor((new Date() - new Date(user.lastLogin)) / (1000 * 60 * 60));

        if (hoursSinceLogin < 1) {
          lastLoginStatus = 'En línea';
          lastLoginColor = 'green';
        } else if (hoursSinceLogin < 24) {
          lastLoginStatus = `Hace ${hoursSinceLogin} hora${hoursSinceLogin > 1 ? 's' : ''}`;
          lastLoginColor = 'blue';
        } else {
          const daysSinceLogin = Math.floor(hoursSinceLogin / 24);
          lastLoginStatus = `Hace ${daysSinceLogin} día${daysSinceLogin > 1 ? 's' : ''}`;
          lastLoginColor = daysSinceLogin > 7 ? 'red' : 'orange';
        }
      }

      // Verificar si la contraseña necesita cambio (más de 90 días)
      const passwordNeedsChange = user.passwordChangedAt
        ? (new Date() - new Date(user.passwordChangedAt)) > (90 * 24 * 60 * 60 * 1000)
        : true;

      return {
        ...user,
        activeSessions,
        lastLoginStatus,
        lastLoginColor,
        passwordNeedsChange,
        isLocked: user.lockedUntil && new Date(user.lockedUntil) > new Date(),
        turnsAttended: user._count.turnRequests
      };
    }));

    // Calcular estadísticas generales
    const stats = {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      byRole: {
        admin: users.filter(u => u.role === 'Administrador').length,
        supervisor: users.filter(u => u.role === 'supervisor').length,
        flebotomista: users.filter(u => u.role === 'flebotomista' || u.role === 'Flebotomista').length,
        recepcion: users.filter(u => u.role === 'recepcion').length,
        laboratorio: users.filter(u => u.role === 'laboratorio').length,
        otros: users.filter(u => !['admin', 'supervisor', 'flebotomista', 'Flebotomista', 'recepcion', 'laboratorio'].includes(u.role)).length
      },
      withActiveSessions: enrichedUsers.filter(u => u.activeSessions > 0).length,
      needPasswordChange: enrichedUsers.filter(u => u.passwordNeedsChange).length
    };

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: decodedToken.userId,
        action: 'VIEW',
        entity: 'User',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      }
    });

    return NextResponse.json({
      success: true,
      data: enrichedUsers,
      stats
    });

  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener usuarios" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Crear nuevo usuario con validaciones completas
export async function POST(request) {
  try {
    // Verificar autorización
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decodedToken;

    try {
      decodedToken = jwt.verify(token, process.env.NEXTAUTH_SECRET || "your-secret-key");
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Token inválido" },
        { status: 401 }
      );
    }

    // Verificar que el usuario sea admin
    const requestingUser = await prisma.user.findUnique({
      where: { id: decodedToken.userId }
    });

    // Aceptar tanto 'admin' como 'Administrador' para compatibilidad
    const isAdmin = requestingUser && (
      requestingUser.role === 'Administrador' ||
      requestingUser.role === 'admin' ||
      requestingUser.role.toLowerCase() === 'admin'
    );

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Acceso denegado. Se requieren permisos de administrador." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, password, name, role, email, phone } = body;

    // Validaciones
    if (!username || !password || !name || !role) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Validar formato de username (alfanumérico, guiones bajos, puntos)
    const usernameRegex = /^[a-zA-Z0-9._]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { success: false, error: "El nombre de usuario debe tener entre 3 y 20 caracteres alfanuméricos" },
        { status: 400 }
      );
    }

    // Validar contraseña (mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número"
        },
        { status: 400 }
      );
    }

    // Validar email si se proporciona
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: "Formato de email inválido" },
          { status: 400 }
        );
      }
    }

    // Verificar que el username no exista
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "El nombre de usuario ya existe" },
        { status: 400 }
      );
    }

    // Verificar que el email no esté en uso si se proporciona
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: { email }
      });

      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: "El email ya está registrado" },
          { status: 400 }
        );
      }
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role,
        email: email || null,
        phone: phone || null,
        isActive: true,
        passwordChangedAt: new Date(),
        failedAttempts: 0
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true
      }
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: decodedToken.userId,
        action: 'CREATE',
        entity: 'User',
        entityId: newUser.id,
        newValue: {
          username: newUser.username,
          name: newUser.name,
          role: newUser.role
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      }
    });

    return NextResponse.json({
      success: true,
      data: newUser,
      message: "Usuario creado exitosamente"
    });

  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear usuario" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
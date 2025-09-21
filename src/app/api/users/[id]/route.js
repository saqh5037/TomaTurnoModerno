import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Helper function to verify admin access
async function verifyAdmin(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "No autorizado", status: 401 };
  }

  const token = authHeader.substring(7);
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.NEXTAUTH_SECRET || "your-secret-key");
  } catch (error) {
    return { error: "Token inválido", status: 401 };
  }

  const user = await prisma.user.findUnique({
    where: { id: decodedToken.userId }
  });

  if (!user || user.role !== 'Administrador') {
    return { error: "Acceso denegado", status: 403 };
  }

  return { user, decodedToken };
}

// GET - Obtener usuario específico con historial
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const authCheck = await verifyAdmin(request);

    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        sessions: {
          where: {
            expiresAt: { gt: new Date() }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        _count: {
          select: {
            turnRequests: true,
            sessions: true,
            auditLogs: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Calcular estadísticas adicionales
    const stats = {
      totalTurnsAttended: user._count.turnRequests,
      totalSessions: user._count.sessions,
      totalAuditLogs: user._count.auditLogs,
      activeSessions: user.sessions.length,
      lastActivity: user.auditLogs[0]?.createdAt || user.lastLogin || user.createdAt,
      accountAge: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
    };

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: authCheck.decodedToken.userId,
        action: 'VIEW',
        entity: 'User',
        entityId: parseInt(id),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        password: undefined, // No enviar contraseña
        stats
      }
    });

  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener usuario" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Actualizar usuario completo
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const authCheck = await verifyAdmin(request);

    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    const { username, password, name, role, email, phone, isActive } = body;

    // Obtener usuario actual para comparación
    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Prevenir auto-desactivación
    if (authCheck.decodedToken.userId === parseInt(id) && isActive === false) {
      return NextResponse.json(
        { success: false, error: "No puedes desactivar tu propia cuenta" },
        { status: 400 }
      );
    }

    // Prevenir eliminar el último admin
    if (currentUser.role === 'Administrador' && role !== 'Administrador') {
      const adminCount = await prisma.user.count({
        where: { role: 'admin', isActive: true }
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, error: "No se puede cambiar el rol del último administrador" },
          { status: 400 }
        );
      }
    }

    // Validaciones
    if (username && username !== currentUser.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "El nombre de usuario ya existe" },
          { status: 400 }
        );
      }
    }

    if (email && email !== currentUser.email) {
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

    // Preparar datos de actualización
    const updateData = {};

    if (username) updateData.username = username;
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    // Si se proporciona nueva contraseña
    if (password) {
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
      updateData.password = await bcrypt.hash(password, 10);
      updateData.passwordChangedAt = new Date();
    }

    updateData.updatedAt = new Date();

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        email: true,
        phone: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: authCheck.decodedToken.userId,
        action: 'UPDATE',
        entity: 'User',
        entityId: parseInt(id),
        oldValue: {
          username: currentUser.username,
          name: currentUser.name,
          role: currentUser.role,
          isActive: currentUser.isActive
        },
        newValue: {
          username: updatedUser.username,
          name: updatedUser.name,
          role: updatedUser.role,
          isActive: updatedUser.isActive
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Usuario actualizado exitosamente"
    });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar usuario" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH - Actualizar campos específicos
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const authCheck = await verifyAdmin(request);

    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    const { field, value } = body;

    // Validar campo permitido
    const allowedFields = ['isActive', 'role', 'email', 'phone'];
    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { success: false, error: "Campo no permitido para actualización rápida" },
        { status: 400 }
      );
    }

    // Obtener usuario actual
    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Validaciones especiales
    if (field === 'isActive' && value === false && authCheck.decodedToken.userId === parseInt(id)) {
      return NextResponse.json(
        { success: false, error: "No puedes desactivar tu propia cuenta" },
        { status: 400 }
      );
    }

    if (field === 'role' && currentUser.role === 'Administrador' && value !== 'admin') {
      const adminCount = await prisma.user.count({
        where: { role: 'admin', isActive: true }
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, error: "No se puede cambiar el rol del último administrador" },
          { status: 400 }
        );
      }
    }

    // Actualizar campo específico
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        [field]: value,
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        email: true,
        phone: true,
        isActive: true,
        updatedAt: true
      }
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: authCheck.decodedToken.userId,
        action: 'UPDATE',
        entity: 'User',
        entityId: parseInt(id),
        oldValue: { [field]: currentUser[field] },
        newValue: { [field]: value },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: `${field} actualizado exitosamente`
    });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar usuario" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Eliminación lógica (soft delete)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const authCheck = await verifyAdmin(request);

    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    // Prevenir auto-eliminación
    if (authCheck.decodedToken.userId === parseInt(id)) {
      return NextResponse.json(
        { success: false, error: "No puedes eliminar tu propia cuenta" },
        { status: 400 }
      );
    }

    // Obtener usuario actual
    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Prevenir eliminar el último admin
    if (currentUser.role === 'Administrador') {
      const adminCount = await prisma.user.count({
        where: { role: 'admin', isActive: true }
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, error: "No se puede eliminar el último administrador" },
          { status: 400 }
        );
      }
    }

    // Eliminación lógica (desactivar usuario)
    const deletedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        isActive: false,
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        name: true
      }
    });

    // Cerrar todas las sesiones del usuario
    await prisma.session.updateMany({
      where: { userId: parseInt(id) },
      data: { expiresAt: new Date() }
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: authCheck.decodedToken.userId,
        action: 'DELETE',
        entity: 'User',
        entityId: parseInt(id),
        oldValue: {
          username: currentUser.username,
          name: currentUser.name,
          isActive: true
        },
        newValue: {
          isActive: false
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      }
    });

    return NextResponse.json({
      success: true,
      data: deletedUser,
      message: "Usuario desactivado exitosamente"
    });

  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar usuario" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
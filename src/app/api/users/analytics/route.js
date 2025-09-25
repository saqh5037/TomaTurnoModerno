import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// GET - Obtener métricas y estadísticas de usuarios
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
      requestingUser.role?.toLowerCase() === 'admin'
    );

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Acceso denegado. Se requieren permisos de administrador." },
        { status: 403 }
      );
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Métricas generales
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      lockedUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.count({ where: { lockedUntil: { gt: now } } })
    ]);

    // Usuarios por rol
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      },
      where: {
        isActive: true
      }
    });

    // Actividad por período
    const [
      activeLastDay,
      activeLast7Days,
      activeLast30Days
    ] = await Promise.all([
      prisma.user.count({
        where: {
          lastLogin: { gte: oneDayAgo }
        }
      }),
      prisma.user.count({
        where: {
          lastLogin: { gte: sevenDaysAgo }
        }
      }),
      prisma.user.count({
        where: {
          lastLogin: { gte: thirtyDaysAgo }
        }
      })
    ]);

    // Usuarios sin acceso reciente (más de 30 días)
    const inactiveUsers30Days = await prisma.user.findMany({
      where: {
        OR: [
          { lastLogin: { lt: thirtyDaysAgo } },
          { lastLogin: null }
        ],
        isActive: true
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        lastLogin: true
      },
      orderBy: {
        lastLogin: 'asc'
      },
      take: 10
    });

    // Top 10 usuarios más activos (por turnos atendidos)
    const topActiveUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        turnRequests: {
          some: {
            finishedAt: {
              gte: thirtyDaysAgo
            }
          }
        }
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        _count: {
          select: {
            turnRequests: {
              where: {
                finishedAt: {
                  gte: thirtyDaysAgo
                }
              }
            }
          }
        }
      },
      orderBy: {
        turnRequests: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // Sesiones activas actuales
    const activeSessions = await prisma.session.count({
      where: {
        expiresAt: { gt: now }
      }
    });

    // Usuarios con sesiones activas
    const usersWithActiveSessions = await prisma.user.findMany({
      where: {
        sessions: {
          some: {
            expiresAt: { gt: now }
          }
        }
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        lastLogin: true,
        _count: {
          select: {
            sessions: {
              where: {
                expiresAt: { gt: now }
              }
            }
          }
        }
      }
    });

    // Usuarios que necesitan cambio de contraseña
    const passwordChangeNeeded = await prisma.user.count({
      where: {
        OR: [
          { passwordChangedAt: null },
          { passwordChangedAt: { lt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } }
        ],
        isActive: true
      }
    });

    // Nuevos usuarios en los últimos 30 días
    const newUsersLast30Days = await prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    // Actividad de auditoría reciente
    const recentAuditActivity = await prisma.auditLog.groupBy({
      by: ['action'],
      _count: {
        action: true
      },
      where: {
        createdAt: { gte: oneDayAgo }
      }
    });

    // Compilar todas las métricas
    const analytics = {
      overview: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        locked: lockedUsers,
        activeSessions,
        passwordChangeNeeded,
        newUsersLast30Days
      },
      byRole: usersByRole.map(item => ({
        role: item.role,
        count: item._count.role
      })),
      activity: {
        last24Hours: activeLastDay,
        last7Days: activeLast7Days,
        last30Days: activeLast30Days,
        inactive30Days: totalUsers - activeLast30Days
      },
      topUsers: topActiveUsers.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        turnsAttended: user._count.turnRequests
      })),
      inactiveUsers: inactiveUsers30Days.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin,
        daysSinceLogin: user.lastLogin
          ? Math.floor((now - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24))
          : null
      })),
      onlineNow: usersWithActiveSessions.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        activeSessions: user._count.sessions
      })),
      recentActions: recentAuditActivity.map(item => ({
        action: item.action,
        count: item._count.action
      })),
      trends: {
        userGrowth: {
          label: "Crecimiento de usuarios",
          value: newUsersLast30Days,
          percentage: totalUsers > 0 ? ((newUsersLast30Days / totalUsers) * 100).toFixed(1) : 0
        },
        activityRate: {
          label: "Tasa de actividad (30 días)",
          value: activeLast30Days,
          percentage: totalUsers > 0 ? ((activeLast30Days / totalUsers) * 100).toFixed(1) : 0
        },
        sessionRate: {
          label: "Usuarios con sesión activa",
          value: usersWithActiveSessions.length,
          percentage: activeUsers > 0 ? ((usersWithActiveSessions.length / activeUsers) * 100).toFixed(1) : 0
        }
      }
    };

    // Registrar consulta en auditoría
    await prisma.auditLog.create({
      data: {
        userId: decodedToken.userId,
        action: 'VIEW_ANALYTICS',
        entity: 'User',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      }
    });

    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error("Error al obtener analytics:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener analytics" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
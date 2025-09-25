import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfToday = new Date(today.getTime());
    const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);

    // Get this month's date range
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get last month for comparison
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Parallel queries for performance
    const [
      totalPatientsMonth,
      totalPatientsLastMonth,
      totalToday,
      attendedToday,
      pendingNow,
      inProgressNow,
      attendedTurnsToday,
      activePhlebotomists
    ] = await Promise.all([
      // Total patients this month
      prisma.turnRequest.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),

      // Total patients last month
      prisma.turnRequest.count({
        where: {
          createdAt: {
            gte: lastMonth,
            lte: endOfLastMonth,
          },
        },
      }),

      // Total created today
      prisma.turnRequest.count({
        where: {
          createdAt: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      }),

      // Attended today
      prisma.turnRequest.count({
        where: {
          status: "Attended",
          finishedAt: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      }),

      // Current pending
      prisma.turnRequest.count({
        where: {
          status: "Pending",
        },
      }),

      // Current in progress
      prisma.turnRequest.count({
        where: {
          status: "InProgress",
        },
      }),

      // Get attended turns with timing data for average calculation
      prisma.turnRequest.findMany({
        where: {
          status: "Attended",
          finishedAt: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
        select: {
          createdAt: true,
          finishedAt: true,
          calledAt: true,
        },
      }),

      // Active phlebotomists (users with role containing "flebotomista" or who attended patients today)
      prisma.user.count({
        where: {
          isActive: true,
          OR: [
            { role: { contains: "flebotomista", mode: 'insensitive' } },
            {
              turnRequests: {
                some: {
                  finishedAt: {
                    gte: startOfToday,
                    lte: endOfToday,
                  }
                }
              }
            }
          ],
        },
      })
    ]);

    // Calculate average wait time
    let averageWaitTime = 0;
    if (attendedTurnsToday.length > 0) {
      const validTurns = attendedTurnsToday.filter(turn => {
        const startTime = turn.calledAt || turn.createdAt;
        return startTime && turn.finishedAt;
      });

      if (validTurns.length > 0) {
        const totalTime = validTurns.reduce((sum, turn) => {
          const startTime = turn.calledAt || turn.createdAt;
          const timeDiff = new Date(turn.finishedAt) - new Date(startTime);
          const maxReasonableTime = 4 * 60 * 60 * 1000; // 4 hours max
          return sum + Math.min(timeDiff, maxReasonableTime);
        }, 0);

        averageWaitTime = Math.round(totalTime / validTurns.length / 1000 / 60); // minutes
      }
    }

    // Calculate efficiency
    const totalProcessedToday = attendedToday + pendingNow + inProgressNow;
    const efficiency = totalProcessedToday > 0 ?
      Math.round((attendedToday / totalProcessedToday) * 100) : 0;

    // Calculate trends (percentage change from last month)
    const trendsPatients = totalPatientsLastMonth > 0 ?
      ((totalPatientsMonth - totalPatientsLastMonth) / totalPatientsLastMonth * 100).toFixed(1) : 0;

    // Get monthly data for chart (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const monthCount = await prisma.turnRequest.count({
        where: {
          status: "Attended",
          finishedAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      monthlyData.push({
        month: monthStart.toLocaleDateString('es-ES', { month: 'short' }),
        pacientes: monthCount,
        promedio: Math.round(Math.random() * 5 + 15), // Placeholder for average time
        porcentaje: monthCount > 0 ? Math.min(100, Math.round(monthCount / 10)) : 0
      });
    }

    // Get top phlebotomists
    const topPhlebotomists = await prisma.user.findMany({
      where: {
        turnRequests: {
          some: {
            finishedAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
            status: "Attended"
          }
        }
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            turnRequests: {
              where: {
                finishedAt: {
                  gte: startOfMonth,
                  lte: endOfMonth,
                },
                status: "Attended"
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
      take: 5
    });

    const responseData = {
      overview: {
        totalPatients: totalPatientsMonth,
        totalToday: totalToday,
        averageWaitTime: averageWaitTime,
        efficiency: efficiency,
        activePhlebotomists: activePhlebotomists,
        completedToday: attendedToday,
        trendsPatients: parseFloat(trendsPatients),
        trendsEfficiency: Math.round(Math.random() * 10 - 5), // Placeholder
        trendsWaitTime: Math.round(Math.random() * 20 - 10) // Placeholder
      },
      monthlyData: monthlyData,
      dailyData: [], // Could be populated if needed
      phlebotomistData: topPhlebotomists.map(p => ({
        name: p.name,
        pacientes: p._count.turnRequests,
        promedio: Math.round(15 + Math.random() * 10), // Placeholder
        eficiencia: Math.min(100, Math.round(p._count.turnRequests * 5 + 70))
      })),
      trends: {
        patients: parseFloat(trendsPatients),
        efficiency: efficiency,
        waitTime: averageWaitTime
      }
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: responseData,
        timestamp: now.toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error fetching dashboard statistics",
        details: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
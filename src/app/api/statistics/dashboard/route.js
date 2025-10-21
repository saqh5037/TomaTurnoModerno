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

    // Calculate efficiency trend (this month vs last month)
    const attendedLastMonth = await prisma.turnRequest.count({
      where: {
        status: "Attended",
        finishedAt: {
          gte: lastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    const totalProcessedLastMonth = await prisma.turnRequest.count({
      where: {
        createdAt: {
          gte: lastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    const efficiencyLastMonth = totalProcessedLastMonth > 0 ?
      Math.round((attendedLastMonth / totalProcessedLastMonth) * 100) : 0;

    const trendsEfficiency = efficiencyLastMonth > 0 ?
      parseFloat((efficiency - efficiencyLastMonth).toFixed(1)) : 0;

    // Calculate wait time trend (this month avg vs last month avg)
    const lastMonthTurns = await prisma.turnRequest.findMany({
      where: {
        status: "Attended",
        finishedAt: {
          gte: lastMonth,
          lte: endOfLastMonth,
        },
      },
      select: {
        createdAt: true,
        finishedAt: true,
        calledAt: true,
      },
    });

    let averageWaitTimeLastMonth = 0;
    if (lastMonthTurns.length > 0) {
      const validLastMonthTurns = lastMonthTurns.filter(turn => {
        const startTime = turn.calledAt || turn.createdAt;
        return startTime && turn.finishedAt;
      });

      if (validLastMonthTurns.length > 0) {
        const totalLastMonthTime = validLastMonthTurns.reduce((sum, turn) => {
          const startTime = turn.calledAt || turn.createdAt;
          const timeDiff = new Date(turn.finishedAt) - new Date(startTime);
          return sum + Math.min(timeDiff, 4 * 60 * 60 * 1000);
        }, 0);
        averageWaitTimeLastMonth = Math.round(totalLastMonthTime / validLastMonthTurns.length / 1000 / 60);
      }
    }

    const trendsWaitTime = averageWaitTimeLastMonth > 0 ?
      parseFloat((averageWaitTime - averageWaitTimeLastMonth).toFixed(1)) : 0;

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

      // Get average time for this month
      const monthTurns = await prisma.turnRequest.findMany({
        where: {
          status: "Attended",
          finishedAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: {
          createdAt: true,
          finishedAt: true,
          calledAt: true,
        },
      });

      let monthAvgTime = 0;
      if (monthTurns.length > 0) {
        const validMonthTurns = monthTurns.filter(turn => {
          const startTime = turn.calledAt || turn.createdAt;
          return startTime && turn.finishedAt;
        });

        if (validMonthTurns.length > 0) {
          const totalMonthTime = validMonthTurns.reduce((sum, turn) => {
            const startTime = turn.calledAt || turn.createdAt;
            const timeDiff = new Date(turn.finishedAt) - new Date(startTime);
            return sum + Math.min(timeDiff, 4 * 60 * 60 * 1000);
          }, 0);
          monthAvgTime = Math.round(totalMonthTime / validMonthTurns.length / 1000 / 60);
        }
      }

      monthlyData.push({
        month: monthStart.toLocaleDateString('es-ES', { month: 'short' }),
        pacientes: monthCount,
        promedio: monthAvgTime,
        porcentaje: monthCount > 0 ? Math.min(100, Math.round((monthCount / 150) * 100)) : 0
      });
    }

    // Get top phlebotomists with complete data
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
        role: true,
        status: true,
        lastLogin: true,
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
        },
        turnRequests: {
          where: {
            finishedAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
            status: "Attended"
          },
          select: {
            createdAt: true,
            finishedAt: true,
            calledAt: true
          }
        },
        sessions: {
          where: {
            expiresAt: {
              gte: now
            }
          },
          orderBy: {
            lastActivity: 'desc'
          },
          take: 1,
          select: {
            lastActivity: true
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
        trendsEfficiency: trendsEfficiency,
        trendsWaitTime: trendsWaitTime
      },
      monthlyData: monthlyData,
      dailyData: [], // Could be populated if needed
      phlebotomistData: topPhlebotomists.map(p => {
        // Calculate real average time
        const validTurns = p.turnRequests.filter(turn => {
          const startTime = turn.calledAt || turn.createdAt;
          return startTime && turn.finishedAt;
        });

        let avgTime = 15; // Default
        if (validTurns.length > 0) {
          const totalTime = validTurns.reduce((sum, turn) => {
            const startTime = turn.calledAt || turn.createdAt;
            const timeDiff = new Date(turn.finishedAt) - new Date(startTime);
            const maxReasonableTime = 4 * 60 * 60 * 1000; // 4 hours max
            return sum + Math.min(timeDiff, maxReasonableTime);
          }, 0);
          avgTime = Math.round(totalTime / validTurns.length / 1000 / 60); // minutes
        }

        // Calculate efficiency based on patients attended vs time
        const patientsCount = p._count.turnRequests;
        const expectedPatientsPerMonth = 100; // Baseline
        const efficiencyScore = Math.min(100, Math.round((patientsCount / expectedPatientsPerMonth) * 100));

        // Calculate rating based on efficiency and average time
        // Good time is <= 15 min, excellent efficiency is >= 80%
        const timeScore = avgTime <= 15 ? 5.0 : avgTime <= 20 ? 4.0 : 3.5;
        const effScore = efficiencyScore >= 80 ? 5.0 : efficiencyScore >= 60 ? 4.0 : 3.5;
        const rating = parseFloat(((timeScore + effScore) / 2).toFixed(1));

        // Determine status based on recent activity
        const hasActiveSession = p.sessions && p.sessions.length > 0;
        const lastActivity = hasActiveSession ? p.sessions[0].lastActivity : p.lastLogin;
        const hoursSinceActivity = lastActivity ? (now - new Date(lastActivity)) / (1000 * 60 * 60) : 999;

        let status = 'active';
        if (hoursSinceActivity > 8) {
          status = 'inactive';
        } else if (hoursSinceActivity > 2) {
          status = 'break';
        }

        // Determine specialty from role
        let especialidad = 'Flebotomía General';
        if (p.role && p.role.toLowerCase().includes('supervisor')) {
          especialidad = 'Supervisor de Flebotomía';
        } else if (p.role && p.role.toLowerCase().includes('senior')) {
          especialidad = 'Flebotomista Senior';
        } else if (p.role && p.role.toLowerCase().includes('especialista')) {
          especialidad = 'Flebotomista Especialista';
        }

        return {
          name: p.name,
          pacientes: patientsCount,
          tiempo: avgTime,
          promedio: avgTime, // Same as tiempo for consistency
          eficiencia: efficiencyScore,
          rating: rating,
          especialidad: especialidad,
          status: status
        };
      }),
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
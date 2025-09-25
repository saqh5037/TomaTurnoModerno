import prisma from '@/lib/prisma';

// GET: Returns current day statistics
export async function GET() {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Get total attended patients today
    const totalAttended = await prisma.turnRequest.count({
      where: {
        status: "Attended",
        finishedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Get attended patients with time data for average calculation
    const attendedTurns = await prisma.turnRequest.findMany({
      where: {
        status: "Attended",
        finishedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        createdAt: true,
        finishedAt: true,
        calledAt: true,
      },
    });

    // Calculate average attention time in minutes
    let averageAttentionTime = 0;
    if (attendedTurns.length > 0) {
      const validTurns = attendedTurns.filter(turn => {
        // Use calledAt if available, otherwise use createdAt
        const startTime = turn.calledAt || turn.createdAt;
        return startTime && turn.finishedAt;
      });

      if (validTurns.length > 0) {
        const totalTime = validTurns.reduce((sum, turn) => {
          const startTime = turn.calledAt || turn.createdAt;
          const timeDiff = new Date(turn.finishedAt) - new Date(startTime);
          // Only count reasonable times (less than 4 hours per turn)
          const maxReasonableTime = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
          const validTimeDiff = Math.min(timeDiff, maxReasonableTime);
          return sum + validTimeDiff;
        }, 0);
        averageAttentionTime = Math.round(totalTime / validTurns.length / 1000 / 60); // Convert to minutes
      }
    }

    // Get total pending patients
    const totalPending = await prisma.turnRequest.count({
      where: {
        status: "Pending",
      },
    });

    // Get total in progress patients
    const totalInProgress = await prisma.turnRequest.count({
      where: {
        status: "In Progress",
      },
    });

    // Calculate efficiency percentage (attended vs total processed today)
    const totalProcessed = totalAttended + totalPending + totalInProgress;
    const efficiencyPercentage = totalProcessed > 0 ? Math.round((totalAttended / totalProcessed) * 100) : 0;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          totalAttended,
          averageAttentionTime,
          efficiencyPercentage,
          totalPending,
          totalInProgress,
          date: today.toISOString().split('T')[0],
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching daily statistics:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Error fetching daily statistics" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST: Returns statistics for specific year/month (legacy endpoint)
export async function POST(req) {
  try {
    const { year, month } = await req.json();

    const filters = {};
    if (year) {
      filters.createdAt = {
        gte: new Date(year, month ? month - 1 : 0, 1),
        lt: new Date(year, month ? month : 12, 1),
      };
    }

    // First, let's get the data grouped by day for the specified period
    const data = await prisma.turnRequest.findMany({
      where: {
        status: "Attended",
        finishedAt: filters.createdAt || {
          gte: new Date(year || new Date().getFullYear(), month ? month - 1 : 0, 1),
          lt: new Date(year || new Date().getFullYear(), month ? month : 12, 1),
        },
      },
      select: {
        id: true,
        finishedAt: true,
      },
    });

    // Agrupar por días del mes usando finishedAt
    const dailyData = data.reduce((acc, item) => {
      if (item.finishedAt) {
        const date = new Date(item.finishedAt);
        const day = date.getDate();
        acc[day] = (acc[day] || 0) + 1;
      }
      return acc;
    }, {});

    // Calcular el total general
    const totalPatients = data.length;

    return new Response(
      JSON.stringify({
        dailyData,
        total: totalPatients,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching daily statistics:", error);
    return new Response("Error fetching daily statistics", { status: 500 });
  }
}

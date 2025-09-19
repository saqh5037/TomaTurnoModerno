import prisma from '@/lib/prisma';

// GET: Returns current day statistics for specific phlebotomist
export async function GET(req) {
  try {
    // Get userId from query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "userId parameter is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Get total attended patients TODAY by THIS phlebotomist
    const totalAttended = await prisma.turnRequest.count({
      where: {
        status: "Attended",
        attendedBy: parseInt(userId),
        finishedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Get attended patients by this phlebotomist today with time data for average calculation
    const attendedTurns = await prisma.turnRequest.findMany({
      where: {
        status: "Attended",
        attendedBy: parseInt(userId),
        finishedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        createdAt: true,
        finishedAt: true,
        calledAt: true,
        patientName: true,
        assignedTurn: true,
      },
    });

    // Calculate average attention time in minutes (using calledAt when available)
    let averageAttentionTime = 0;
    let validTurnsCount = 0;

    if (attendedTurns.length > 0) {
      const totalTime = attendedTurns.reduce((sum, turn) => {
        // Use calledAt if available, otherwise use the same day's start
        let startTime;

        if (turn.calledAt) {
          startTime = new Date(turn.calledAt);
        } else {
          // If calledAt is not available, assume the turn started today
          // This avoids counting days-old created times
          const createdTime = new Date(turn.createdAt);
          if (createdTime >= startOfDay) {
            startTime = createdTime;
          } else {
            // If created before today, use a reasonable default (30 min before finish)
            startTime = new Date(turn.finishedAt);
            startTime.setMinutes(startTime.getMinutes() - 30);
          }
        }

        const finishTime = new Date(turn.finishedAt);
        const timeDiff = finishTime - startTime;

        // Only count reasonable times (between 1 minute and 60 minutes)
        if (timeDiff > 60 * 1000 && timeDiff < 60 * 60 * 1000) { // Between 1 min and 60 min
          validTurnsCount++;
          return sum + timeDiff;
        }
        return sum;
      }, 0);

      if (validTurnsCount > 0) {
        averageAttentionTime = Math.round(totalTime / validTurnsCount / 1000 / 60); // Convert to minutes
      } else if (attendedTurns.length > 0) {
        // If no valid times, use a default average
        averageAttentionTime = 15; // Default 15 minutes
      }
    }

    // Get total pending patients (global, not per phlebotomist)
    const totalPending = await prisma.turnRequest.count({
      where: {
        status: "Pending",
      },
    });

    // Get total in progress patients (global)
    const totalInProgress = await prisma.turnRequest.count({
      where: {
        status: "In Progress",
      },
    });

    // Calculate efficiency percentage for this phlebotomist today
    const targetPerDay = 20; // Expected patients per phlebotomist per day
    const efficiencyPercentage = totalAttended > 0 ? Math.min(Math.round((totalAttended / targetPerDay) * 100), 100) : 0;

    // Get phlebotomist name
    const phlebotomist = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { name: true },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          totalAttended,
          averageAttentionTime,
          efficiencyPercentage,
          totalPending,
          totalInProgress,
          phlebotomistName: phlebotomist?.name || 'Unknown',
          date: today.toISOString().split('T')[0],
          details: {
            validTurnsForAverage: validTurnsCount,
            totalTurnsToday: attendedTurns.length,
          }
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching phlebotomist daily statistics:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Error fetching phlebotomist daily statistics" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
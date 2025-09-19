import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { turnId } = await req.json();

    if (!turnId) {
      return new Response(
        JSON.stringify({ success: false, error: "turnId is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if the turn exists and is in Pending status
    const turn = await prisma.turnRequest.findUnique({
      where: { id: turnId },
      select: {
        id: true,
        status: true,
        assignedTurn: true,
        patientName: true,
      },
    });

    if (!turn) {
      return new Response(
        JSON.stringify({ success: false, error: "Turn not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (turn.status !== "Pending") {
      return new Response(
        JSON.stringify({ success: false, error: "Can only skip turns with Pending status" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find the highest assignedTurn number among pending turns
    const maxAssignedTurn = await prisma.turnRequest.aggregate({
      where: {
        status: "Pending",
      },
      _max: {
        assignedTurn: true,
      },
    });

    // Calculate new position (higher than the current maximum)
    const newAssignedTurn = (maxAssignedTurn._max.assignedTurn || 0) + 1;

    // Update the turn to move it to the end of the queue
    const updatedTurn = await prisma.turnRequest.update({
      where: { id: turnId },
      data: {
        assignedTurn: newAssignedTurn,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        patientName: true,
        assignedTurn: true,
        status: true,
        updatedAt: true,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: updatedTurn,
        message: `Turn #${turn.assignedTurn} moved to position #${newAssignedTurn}`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error skipping turn:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Error skipping turn" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
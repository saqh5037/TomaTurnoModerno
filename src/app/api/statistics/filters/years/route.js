import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const years = await prisma.turnRequest.findMany({
      select: {
        createdAt: true,
      },
      distinct: ["createdAt"],
    });

    const uniqueYears = Array.from(
      new Set(years.map((record) => new Date(record.createdAt).getFullYear()))
    ).sort((a, b) => a - b);

    return new Response(JSON.stringify(uniqueYears), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching years:", error);
    return new Response("Error fetching years", { status: 500 });
  }
}

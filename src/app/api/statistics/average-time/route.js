// src/app/api/statistics/average-time/route.js
import { parseISO, differenceInSeconds } from 'date-fns';
import prisma from '../../../../../lib/prisma.js';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    const filters = {
      status: 'Completed',
    };

    let startFilterDate, endFilterDate;

    // Si se selecciona año y/o mes, aplicamos los filtros de rango de fecha a createdAt
    if (yearParam && monthParam) {
      const year = parseInt(yearParam);
      const month = parseInt(monthParam); // Mes es 1-indexed (1-12)

      startFilterDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      endFilterDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      endFilterDate.setUTCMilliseconds(endFilterDate.getUTCMilliseconds() - 1);

      filters.createdAt = {
        gte: startFilterDate,
        lte: endFilterDate,
      };
    } else if (yearParam) {
      const year = parseInt(yearParam);
      startFilterDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
      endFilterDate = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0, 0));
      endFilterDate.setUTCMilliseconds(endFilterDate.getUTCMilliseconds() - 1);

      filters.createdAt = {
        gte: startFilterDate,
        lte: endFilterDate,
      };
    }

    // Importante: Aquí NO añadimos filtros explícitos como `createdAt: { not: null }`
    // o `finishedAt: { not: null }` directamente en el `filters` del `findMany`.
    // Confiamos en que la base de datos solo tendrá turnos 'Attended' con fechas,
    // y la validación en el bucle 'for...of' (`if (turn.createdAt && turn.finishedAt ... )`)
    // se encargará de cualquier caso borde si las fechas fueran nulas a pesar del status.

    console.log("-----------------------------------------");
    console.log("API /api/statistics/average-time recibió filtros:");
    console.log(`yearParam: ${yearParam}, monthParam: ${monthParam}`);
    console.log("Filtros finales para Prisma:", JSON.stringify(filters, null, 2));
    if (startFilterDate && endFilterDate) {
        console.log(`Rango de filtro UTC: ${startFilterDate.toISOString()} a ${endFilterDate.toISOString()}`);
    }
    console.log("-----------------------------------------");

    const attendedTurns = await prisma.turnRequest.findMany({
      where: filters, // Usamos los filtros construidos
      select: {
        id: true,
        attendedBy: true,
        createdAt: true,
        finishedAt: true,
        user: {
          select: { name: true },
        },
      },
    });

    console.log(`Número de turnos encontrados: ${attendedTurns.length}`);
    if (attendedTurns.length > 0) {
        console.log("Muestra de fechas de los turnos encontrados:");
        attendedTurns.slice(0, 5).forEach(turn => {
            console.log(`  ID: ${turn.id}, createdAt (DB): ${turn.createdAt.toISOString()}, finishedAt (DB): ${turn.finishedAt.toISOString()}`);
        });
        if (attendedTurns.length > 5) {
            console.log(`  ... y ${attendedTurns.length - 5} más.`);
        }
    }
    console.log("-----------------------------------------");

    const phlebotomistDailyStats = new Map();
    const phlebotomistTotalStats = new Map();

    for (const turn of attendedTurns) {
      // Verificación de no-nulidad aquí, antes de usar las fechas
      if (turn.createdAt && turn.finishedAt && turn.attendedBy && turn.user) {
        const start = parseISO(turn.createdAt.toISOString());
        const end = parseISO(turn.finishedAt.toISOString());

        const durationSeconds = differenceInSeconds(end, start);
        const phlebotomistName = turn.user.name;
        
        const dayOfMonth = turn.createdAt.getDate(); 

        if (!phlebotomistDailyStats.has(phlebotomistName)) {
          phlebotomistDailyStats.set(phlebotomistName, new Map());
        }
        const dailyData = phlebotomistDailyStats.get(phlebotomistName);
        if (!dailyData.has(dayOfMonth)) {
          dailyData.set(dayOfMonth, { totalDuration: 0, count: 0 });
        }
        dailyData.get(dayOfMonth).totalDuration += durationSeconds;
        dailyData.get(dayOfMonth).count += 1;

        if (!phlebotomistTotalStats.has(phlebotomistName)) {
          phlebotomistTotalStats.set(phlebotomistName, { totalDuration: 0, count: 0 });
        }
        phlebotomistTotalStats.get(phlebotomistName).totalDuration += durationSeconds;
        phlebotomistTotalStats.get(phlebotomistName).count += 1;
      }
    }

    const result = {
      phlebotomists: [],
      dailySummary: {},
      overallAverage: 0,
      overallTotalPatients: 0,
    };

    let totalAllDurations = 0;
    let countAllPatients = 0;

    for (const [phlebotomistName, totalData] of phlebotomistTotalStats.entries()) {
      const averageDurationMinutes = parseFloat((totalData.totalDuration / totalData.count / 60).toFixed(2));
      result.phlebotomists.push({
        name: phlebotomistName,
        averageDuration: averageDurationMinutes,
        totalPatients: totalData.count,
      });
      totalAllDurations += totalData.totalDuration;
      countAllPatients += totalData.count;

      const dailyMap = phlebotomistDailyStats.get(phlebotomistName);
      const formattedDailyData = {};
      for (const [day, data] of dailyMap.entries()) {
        formattedDailyData[day] = parseFloat((data.totalDuration / data.count / 60).toFixed(2));
      }
      result.dailySummary[phlebotomistName] = formattedDailyData;
    }

    result.overallAverage = countAllPatients > 0 ? parseFloat((totalAllDurations / countAllPatients / 60).toFixed(2)) : 0;
    result.overallTotalPatients = countAllPatients;

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error fetching average time statistics:", error);
    return new Response(JSON.stringify({ error: "Error al cargar las estadísticas de tiempo promedio." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
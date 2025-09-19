const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDailyStats() {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    console.log('Verificando estadísticas del día:', today.toLocaleDateString('es-MX'));
    console.log('Rango de búsqueda:');
    console.log('  Desde:', startOfDay.toISOString());
    console.log('  Hasta:', endOfDay.toISOString());
    console.log('-----------------------------------');

    // 1. Verificar TODOS los turnos de hoy
    const allTurnsToday = await prisma.turnRequest.findMany({
      where: {
        OR: [
          {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            }
          },
          {
            finishedAt: {
              gte: startOfDay,
              lte: endOfDay,
            }
          }
        ]
      },
      select: {
        id: true,
        assignedTurn: true,
        patientName: true,
        status: true,
        createdAt: true,
        finishedAt: true,
        attendedBy: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\n📊 TOTAL de turnos relacionados con hoy: ${allTurnsToday.length}`);

    // 2. Agrupar por status
    const statusCount = {};
    allTurnsToday.forEach(turn => {
      statusCount[turn.status] = (statusCount[turn.status] || 0) + 1;
    });

    console.log('\n📈 Distribución por estado:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} pacientes`);
    });

    // 3. Específicamente los atendidos
    const attendedToday = allTurnsToday.filter(turn =>
      turn.status === 'Attended' &&
      turn.finishedAt &&
      new Date(turn.finishedAt) >= startOfDay &&
      new Date(turn.finishedAt) <= endOfDay
    );

    console.log(`\n✅ Pacientes ATENDIDOS hoy: ${attendedToday.length}`);

    if (attendedToday.length > 0) {
      console.log('\nDetalle de pacientes atendidos:');
      attendedToday.forEach(turn => {
        const timeInMinutes = turn.createdAt && turn.finishedAt ?
          Math.round((new Date(turn.finishedAt) - new Date(turn.createdAt)) / 1000 / 60) : 0;
        console.log(`  - Turno #${turn.assignedTurn}: ${turn.patientName}`);
        console.log(`    Tiempo de atención: ${timeInMinutes} minutos`);
        console.log(`    Finalizado: ${new Date(turn.finishedAt).toLocaleTimeString('es-MX')}`);
      });

      // Calcular tiempo promedio
      const totalTime = attendedToday.reduce((sum, turn) => {
        if (turn.createdAt && turn.finishedAt) {
          return sum + (new Date(turn.finishedAt) - new Date(turn.createdAt));
        }
        return sum;
      }, 0);
      const avgTimeMinutes = Math.round(totalTime / attendedToday.length / 1000 / 60);
      console.log(`\n⏱️ Tiempo promedio de atención: ${avgTimeMinutes} minutos`);
    }

    // 4. Verificar otros estados
    const pending = await prisma.turnRequest.count({
      where: { status: "Pending" }
    });
    const inProgress = await prisma.turnRequest.count({
      where: { status: "In Progress" }
    });

    console.log(`\n📋 Estado actual del sistema:`);
    console.log(`  En espera: ${pending}`);
    console.log(`  En atención: ${inProgress}`);

    // 5. Verificar si hay problemas con las fechas
    const turnsWithNullDates = await prisma.turnRequest.count({
      where: {
        status: "Attended",
        OR: [
          { createdAt: null },
          { finishedAt: null }
        ]
      }
    });

    if (turnsWithNullDates > 0) {
      console.log(`\n⚠️ ADVERTENCIA: Hay ${turnsWithNullDates} turnos atendidos con fechas NULL`);
    }

    // 6. Verificar últimos 10 turnos atendidos (sin importar fecha)
    const recentAttended = await prisma.turnRequest.findMany({
      where: { status: "Attended" },
      orderBy: { finishedAt: 'desc' },
      take: 10,
      select: {
        assignedTurn: true,
        patientName: true,
        finishedAt: true,
      }
    });

    if (recentAttended.length > 0) {
      console.log('\n🔍 Últimos 10 pacientes atendidos (cualquier día):');
      recentAttended.forEach(turn => {
        const date = turn.finishedAt ? new Date(turn.finishedAt) : null;
        console.log(`  - Turno #${turn.assignedTurn}: ${turn.patientName} - ${date ? date.toLocaleString('es-MX') : 'Sin fecha'}`);
      });
    }

  } catch (error) {
    console.error('Error al verificar estadísticas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDailyStats();
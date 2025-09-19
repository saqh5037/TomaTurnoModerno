const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyPhlebotomistTimes(userId = 1) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    console.log('=================================================');
    console.log('VERIFICACIÓN DE TIEMPOS DE ATENCIÓN');
    console.log('=================================================');
    console.log(`Fecha: ${today.toLocaleDateString('es-MX')}`);
    console.log(`Usuario ID: ${userId}`);

    // Obtener información del flebotomista
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });
    console.log(`Flebotomista: ${user?.name || 'Desconocido'}`);
    console.log('=================================================\n');

    // Obtener todos los turnos atendidos hoy por este flebotomista
    const attendedTurns = await prisma.turnRequest.findMany({
      where: {
        status: "Attended",
        attendedBy: userId,
        finishedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        assignedTurn: true,
        patientName: true,
        createdAt: true,
        calledAt: true,
        finishedAt: true,
      },
      orderBy: {
        finishedAt: 'desc'
      }
    });

    console.log(`📊 TOTAL DE PACIENTES ATENDIDOS HOY: ${attendedTurns.length}\n`);

    if (attendedTurns.length === 0) {
      console.log('No hay pacientes atendidos hoy por este flebotomista.');
      return;
    }

    console.log('DETALLE DE CADA ATENCIÓN:');
    console.log('─────────────────────────────────────────────────');

    let totalValidTime = 0;
    let validCount = 0;
    const timeDetails = [];

    attendedTurns.forEach((turn, index) => {
      console.log(`\n${index + 1}. Turno #${turn.assignedTurn}: ${turn.patientName}`);
      console.log('   ─────────────────────────────────────────');

      const createdTime = new Date(turn.createdAt);
      const finishedTime = new Date(turn.finishedAt);

      // Mostrar todas las fechas
      console.log(`   📅 Creado:    ${createdTime.toLocaleString('es-MX')}`);

      if (turn.calledAt) {
        const calledTime = new Date(turn.calledAt);
        console.log(`   🔔 Llamado:   ${calledTime.toLocaleString('es-MX')}`);
      } else {
        console.log(`   🔔 Llamado:   NO REGISTRADO`);
      }

      console.log(`   ✅ Finalizado: ${finishedTime.toLocaleString('es-MX')}`);

      // Calcular tiempo usando diferentes métodos
      let startTime;
      let timeSource;

      if (turn.calledAt) {
        startTime = new Date(turn.calledAt);
        timeSource = 'calledAt';
      } else if (createdTime >= startOfDay) {
        startTime = createdTime;
        timeSource = 'createdAt (mismo día)';
      } else {
        // Si fue creado antes de hoy, asumimos 30 minutos
        startTime = new Date(finishedTime);
        startTime.setMinutes(startTime.getMinutes() - 30);
        timeSource = 'estimado (30 min)';
      }

      const timeDiffMs = finishedTime - startTime;
      const timeDiffMinutes = Math.round(timeDiffMs / 1000 / 60);

      console.log(`   ⏱️  Tiempo de atención: ${timeDiffMinutes} minutos (usando ${timeSource})`);

      // Validar si el tiempo es razonable (entre 1 y 60 minutos)
      if (timeDiffMinutes >= 1 && timeDiffMinutes <= 60) {
        console.log(`   ✅ Tiempo VÁLIDO para promedio`);
        totalValidTime += timeDiffMs;
        validCount++;
        timeDetails.push({
          turn: turn.assignedTurn,
          patient: turn.patientName,
          minutes: timeDiffMinutes
        });
      } else {
        console.log(`   ⚠️  Tiempo EXCLUIDO del promedio (fuera de rango 1-60 min)`);
      }
    });

    console.log('\n=================================================');
    console.log('RESUMEN DE TIEMPOS:');
    console.log('=================================================');

    if (validCount > 0) {
      const averageMinutes = Math.round(totalValidTime / validCount / 1000 / 60);

      console.log(`\n✅ Turnos válidos para el promedio: ${validCount} de ${attendedTurns.length}`);
      console.log(`⏱️  TIEMPO PROMEDIO DE ATENCIÓN: ${averageMinutes} minutos\n`);

      console.log('Tiempos individuales válidos:');
      timeDetails.forEach(detail => {
        console.log(`   • Turno #${detail.turn} (${detail.patient}): ${detail.minutes} min`);
      });

      // Calcular estadísticas adicionales
      const times = timeDetails.map(d => d.minutes);
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      console.log(`\n📊 Estadísticas adicionales:`);
      console.log(`   • Tiempo mínimo: ${minTime} minutos`);
      console.log(`   • Tiempo máximo: ${maxTime} minutos`);
      console.log(`   • Tiempo promedio: ${averageMinutes} minutos`);
    } else {
      console.log('\n⚠️ No hay turnos con tiempos válidos para calcular el promedio.');
      console.log('   (Todos los tiempos están fuera del rango 1-60 minutos)');
    }

    // Verificar si hay turnos sin calledAt
    const turnsWithoutCalledAt = attendedTurns.filter(t => !t.calledAt);
    if (turnsWithoutCalledAt.length > 0) {
      console.log(`\n⚠️ NOTA: ${turnsWithoutCalledAt.length} turnos no tienen hora de llamado registrada (calledAt).`);
      console.log('   Esto puede afectar la precisión del cálculo del tiempo promedio.');
    }

  } catch (error) {
    console.error('Error al verificar tiempos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar con el userId especificado o usar 1 por defecto
const userId = process.argv[2] ? parseInt(process.argv[2]) : 1;
verifyPhlebotomistTimes(userId);
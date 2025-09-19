const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRealTimes() {
  try {
    console.log('=================================================');
    console.log('ANÁLISIS DE TIEMPOS REALES DE ATENCIÓN');
    console.log('=================================================\n');

    // Buscar turnos que SÍ tienen calledAt registrado
    const turnsWithCalledAt = await prisma.turnRequest.findMany({
      where: {
        status: "Attended",
        calledAt: { not: null },
        finishedAt: { not: null }
      },
      select: {
        assignedTurn: true,
        patientName: true,
        calledAt: true,
        finishedAt: true,
        attendedBy: true
      },
      orderBy: {
        finishedAt: 'desc'
      },
      take: 20
    });

    if (turnsWithCalledAt.length === 0) {
      console.log('⚠️  No hay turnos con tiempo de llamado registrado (calledAt).');
      console.log('    Todos los turnos fueron procesados sin usar el botón "LLAMAR PACIENTE".\n');
      
      // Buscar turnos en progreso para ver si tienen calledAt
      const inProgress = await prisma.turnRequest.findMany({
        where: {
          status: "In Progress",
          calledAt: { not: null }
        },
        select: {
          assignedTurn: true,
          patientName: true,
          calledAt: true
        }
      });

      if (inProgress.length > 0) {
        console.log('📋 Turnos actualmente EN ATENCIÓN con hora de llamado:');
        inProgress.forEach(turn => {
          const calledTime = new Date(turn.calledAt);
          const now = new Date();
          const minutesElapsed = Math.round((now - calledTime) / 1000 / 60);
          console.log(`   • Turno #${turn.assignedTurn}: ${turn.patientName}`);
          console.log(`     Llamado hace: ${minutesElapsed} minutos`);
        });
      }
      
      return;
    }

    console.log(`📊 Turnos encontrados con tiempo real: ${turnsWithCalledAt.length}\n`);
    console.log('DETALLE DE TIEMPOS REALES:');
    console.log('─────────────────────────────────────────────────\n');

    const times = [];
    
    turnsWithCalledAt.forEach((turn, index) => {
      const calledTime = new Date(turn.calledAt);
      const finishedTime = new Date(turn.finishedAt);
      const diffMinutes = Math.round((finishedTime - calledTime) / 1000 / 60);
      
      times.push(diffMinutes);
      
      console.log(`${index + 1}. Turno #${turn.assignedTurn}: ${turn.patientName}`);
      console.log(`   🔔 Llamado:    ${calledTime.toLocaleString('es-MX')}`);
      console.log(`   ✅ Finalizado: ${finishedTime.toLocaleString('es-MX')}`);
      console.log(`   ⏱️  TIEMPO REAL: ${diffMinutes} minutos\n`);
    });

    if (times.length > 0) {
      const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      
      console.log('=================================================');
      console.log('📊 ESTADÍSTICAS DE TIEMPOS REALES:');
      console.log('=================================================');
      console.log(`   • Tiempo MÍNIMO: ${minTime} minutos`);
      console.log(`   • Tiempo MÁXIMO: ${maxTime} minutos`);
      console.log(`   • Tiempo PROMEDIO: ${avgTime} minutos`);
      console.log(`   • Total de muestras: ${times.length} turnos`);
      
      // Distribución de tiempos
      console.log('\n📈 DISTRIBUCIÓN DE TIEMPOS:');
      const ranges = {
        '0-5 min': times.filter(t => t <= 5).length,
        '6-10 min': times.filter(t => t > 5 && t <= 10).length,
        '11-15 min': times.filter(t => t > 10 && t <= 15).length,
        '16-20 min': times.filter(t => t > 15 && t <= 20).length,
        '21-30 min': times.filter(t => t > 20 && t <= 30).length,
        '> 30 min': times.filter(t => t > 30).length
      };
      
      Object.entries(ranges).forEach(([range, count]) => {
        if (count > 0) {
          const percent = ((count / times.length) * 100).toFixed(1);
          console.log(`   • ${range}: ${count} turnos (${percent}%)`);
        }
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRealTimes();

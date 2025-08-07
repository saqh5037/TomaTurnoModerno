require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testStatistics() {
  try {
    console.log('🔍 Probando estadísticas con datos de prueba...');
    
    // 1. Verificar que tenemos datos de prueba
    const totalRecords = await prisma.turnRequest.count({
      where: {
        status: 'Completed',
        createdAt: {
          gte: new Date(2024, 10, 1), // Noviembre 1, 2024
          lt: new Date(2025, 0, 1)   // Enero 1, 2025
        }
      }
    });
    
    console.log(`📊 Total de registros 'Completed' Nov-Dic 2024: ${totalRecords}`);
    
    if (totalRecords === 0) {
      console.log('❌ No hay datos de prueba. Ejecuta primero: node scripts/seedTestData.js');
      return;
    }
    
    // 2. Probar estadísticas mensuales para 2024
    console.log('\n📅 Probando estadísticas mensuales 2024...');
    
    const monthlyData = await prisma.turnRequest.groupBy({
      by: ["createdAt"],
      where: {
        status: "Completed",
        createdAt: {
          gte: new Date(2024, 0, 1),
          lte: new Date(2024, 11, 31),
        }
      },
      _count: {
        id: true,
      },
    });
    
    // Agrupar por mes
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];
    
    const monthlyResults = monthlyData.reduce((acc, item) => {
      const date = new Date(item.createdAt);
      const month = monthNames[date.getMonth()];
      acc[month] = (acc[month] || 0) + item._count.id;
      return acc;
    }, {});
    
    console.log('   Resultados mensuales:', monthlyResults);
    const totalMonthly = Object.values(monthlyResults).reduce((sum, count) => sum + count, 0);
    console.log(`   Total anual: ${totalMonthly}`);
    
    // 3. Probar estadísticas diarias para Noviembre 2024
    console.log('\n📅 Probando estadísticas diarias Noviembre 2024...');
    
    const dailyData = await prisma.turnRequest.groupBy({
      by: ["createdAt"],
      where: {
        status: "Completed",
        createdAt: {
          gte: new Date(2024, 10, 1), // Noviembre
          lt: new Date(2024, 11, 1),  // Diciembre
        }
      },
      _count: {
        id: true,
      },
    });
    
    // Agrupar por días del mes
    const dailyResults = dailyData.reduce((acc, item) => {
      const date = new Date(item.createdAt);
      const day = date.getDate();
      acc[day] = (acc[day] || 0) + item._count.id;
      return acc;
    }, {});
    
    console.log('   Resultados diarios (primeros 10 días):');
    Object.entries(dailyResults)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .slice(0, 10)
      .forEach(([day, count]) => {
        console.log(`     Día ${day}: ${count} pacientes`);
      });
    
    const totalDaily = Object.values(dailyResults).reduce((sum, count) => sum + count, 0);
    console.log(`   Total noviembre: ${totalDaily}`);
    
    // 4. Probar estadísticas de flebotomistas
    console.log('\n👨‍⚕️ Probando estadísticas de flebotomistas...');
    
    const phlebotomists = await prisma.user.findMany({
      where: { role: 'Flebotomista' }
    });
    
    console.log(`   Flebotomistas encontrados: ${phlebotomists.length}`);
    
    if (phlebotomists.length > 0) {
      const firstPhlebotomist = phlebotomists[0];
      console.log(`   Probando con: ${firstPhlebotomist.name} (ID: ${firstPhlebotomist.id})`);
      
      const phlebData = await prisma.$queryRaw`
        SELECT 
          DATE("createdAt") AS "day",
          COUNT(*)::INT AS "count"
        FROM "TurnRequest"
        WHERE "attendedBy" = ${parseInt(firstPhlebotomist.id)}
          AND "status" = 'Completed'
          AND "createdAt" BETWEEN ${new Date(2024, 10, 1)} AND ${new Date(2024, 10, 30, 23, 59, 59)}
        GROUP BY DATE("createdAt")
        ORDER BY DATE("createdAt");
      `;
      
      console.log(`   Datos noviembre para ${firstPhlebotomist.name}:`, phlebData.slice(0, 5));
      const total = phlebData.reduce((sum, item) => sum + Number(item.count), 0);
      console.log(`   Total atendidos en noviembre: ${total}`);
    }
    
    // 5. Probar estadísticas de tiempo promedio
    console.log('\n⏱️  Probando estadísticas de tiempo promedio...');
    
    const attendedTurns = await prisma.turnRequest.findMany({
      where: {
        status: 'Completed',
        createdAt: {
          gte: new Date(2024, 10, 1), // Noviembre
          lt: new Date(2024, 11, 1),  // Diciembre
        }
      },
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
    
    console.log(`   Turnos con tiempo registrado: ${attendedTurns.length}`);
    
    if (attendedTurns.length > 0) {
      // Calcular tiempos promedio por flebotomista
      const phlebStats = new Map();
      
      for (const turn of attendedTurns) {
        if (turn.createdAt && turn.finishedAt && turn.attendedBy && turn.user) {
          const start = new Date(turn.createdAt);
          const end = new Date(turn.finishedAt);
          const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
          const phlebName = turn.user.name;
          
          if (!phlebStats.has(phlebName)) {
            phlebStats.set(phlebName, { totalDuration: 0, count: 0 });
          }
          phlebStats.get(phlebName).totalDuration += durationMinutes;
          phlebStats.get(phlebName).count += 1;
        }
      }
      
      console.log('   Tiempos promedio por flebotomista:');
      for (const [name, stats] of phlebStats.entries()) {
        const avgMinutes = (stats.totalDuration / stats.count).toFixed(2);
        console.log(`     ${name}: ${avgMinutes} min (${stats.count} pacientes)`);
      }
    }
    
    console.log('\n✅ Todas las pruebas de estadísticas completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar las pruebas
if (require.main === module) {
  testStatistics();
}

module.exports = { testStatistics };
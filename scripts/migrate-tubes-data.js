/**
 * Script de Migración de Datos de Tubos
 *
 * Convierte datos legacy de tubesRequired (solo número)
 * al nuevo formato tubesDetails (array JSON con tipos y cantidades)
 *
 * USO:
 *   node scripts/migrate-tubes-data.js [--dry-run] [--limit=N]
 *
 * Opciones:
 *   --dry-run    Solo muestra qué se haría, sin hacer cambios
 *   --limit=N    Procesa solo los primeros N registros (para testing)
 *   --status=X   Solo migra turnos con estado X (ej: --status=Pending)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Parsear argumentos de línea de comando
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;
const statusArg = args.find(arg => arg.startsWith('--status='));
const statusFilter = statusArg ? statusArg.split('=')[1] : null;

console.log(`${colors.bright}${colors.cyan}
╔════════════════════════════════════════════════════════╗
║     MIGRACIÓN DE DATOS DE TUBOS - TomaTurnoModerno    ║
╚════════════════════════════════════════════════════════╝
${colors.reset}`);

console.log(`${colors.yellow}Configuración:${colors.reset}`);
console.log(`  Modo:          ${isDryRun ? colors.yellow + 'DRY RUN (sin cambios)' : colors.green + 'PRODUCCIÓN (aplicará cambios)'}${colors.reset}`);
console.log(`  Límite:        ${limit || 'Sin límite'}`);
console.log(`  Filtro estado: ${statusFilter || 'Todos'}`);
console.log('');

async function migrateTubesData() {
  try {
    // Construir filtro de búsqueda
    const where = {
      tubesRequired: { gt: 0 }  // Solo registros con tubos
    };

    if (statusFilter) {
      where.status = statusFilter;
    }

    // Obtener todos los registros (filtraremos los que tienen tubesDetails después)
    const allTurns = await prisma.turnRequest.findMany({
      where,
      take: limit || undefined,
      select: {
        id: true,
        patientName: true,
        tubesRequired: true,
        tubesDetails: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filtrar solo los que NO tienen tubesDetails
    const turnsToMigrate = allTurns.filter(turn => !turn.tubesDetails);

    console.log(`${colors.blue}📊 Análisis de datos:${colors.reset}`);
    console.log(`  Total registros con tubos: ${colors.bright}${allTurns.length}${colors.reset}`);
    console.log(`  Ya migrados:               ${colors.green}${allTurns.length - turnsToMigrate.length}${colors.reset}`);
    console.log(`  Pendientes de migrar:      ${colors.bright}${turnsToMigrate.length}${colors.reset}\n`);

    if (turnsToMigrate.length === 0) {
      console.log(`${colors.green}✓ No hay registros para migrar. Todos los datos ya están actualizados.${colors.reset}`);
      return;
    }

    console.log(`  Procesando:         ${colors.bright}${turnsToMigrate.length}${colors.reset} registros\n`);

    // Estadísticas
    let migratedCount = 0;
    let errorCount = 0;
    const tubeDistribution = {};

    // Procesar cada turno
    for (const turn of turnsToMigrate) {
      try {
        // Crear tubesDetails en formato nuevo
        // Por defecto, asignamos SST (tubo más común)
        const tubesDetails = [{
          type: 'sst',
          quantity: turn.tubesRequired
        }];

        if (isDryRun) {
          console.log(`${colors.cyan}[DRY RUN]${colors.reset} Turno #${turn.id} - ${turn.patientName}`);
          console.log(`          ${turn.tubesRequired} tubos → ${JSON.stringify(tubesDetails)}`);
        } else {
          // Actualizar en base de datos
          await prisma.turnRequest.update({
            where: { id: turn.id },
            data: {
              tubesDetails: tubesDetails
            }
          });

          migratedCount++;

          if (migratedCount % 10 === 0) {
            console.log(`${colors.green}✓${colors.reset} ${migratedCount} registros migrados...`);
          }
        }

        // Estadísticas
        if (!tubeDistribution[turn.tubesRequired]) {
          tubeDistribution[turn.tubesRequired] = 0;
        }
        tubeDistribution[turn.tubesRequired]++;

      } catch (error) {
        errorCount++;
        console.error(`${colors.red}✗ Error en turno #${turn.id}:${colors.reset}`, error.message);
      }
    }

    // Resumen final
    console.log(`\n${colors.bright}${colors.green}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}RESUMEN DE MIGRACIÓN${colors.reset}\n`);

    if (isDryRun) {
      console.log(`${colors.yellow}⚠ MODO DRY RUN - No se aplicaron cambios${colors.reset}\n`);
    }

    console.log(`${colors.green}✓ Registros procesados:${colors.reset}  ${migratedCount + errorCount}`);
    if (!isDryRun) {
      console.log(`${colors.green}✓ Migrados exitosamente:${colors.reset} ${migratedCount}`);
    }
    if (errorCount > 0) {
      console.log(`${colors.red}✗ Errores:${colors.reset}               ${errorCount}`);
    }

    console.log(`\n${colors.blue}📊 Distribución de tubos:${colors.reset}`);
    Object.entries(tubeDistribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([tubes, count]) => {
        const percentage = ((count / turnsToMigrate.length) * 100).toFixed(1);
        const bar = '█'.repeat(Math.floor(percentage / 5));
        console.log(`  ${tubes.padStart(2)} tubos: ${bar} ${count} registros (${percentage}%)`);
      });

    if (isDryRun) {
      console.log(`\n${colors.yellow}💡 Para aplicar los cambios, ejecuta sin --dry-run:${colors.reset}`);
      console.log(`   ${colors.cyan}node scripts/migrate-tubes-data.js${colors.reset}`);
    } else {
      console.log(`\n${colors.green}✓ Migración completada exitosamente${colors.reset}`);
    }

    console.log(`${colors.bright}${colors.green}═══════════════════════════════════════════════════════${colors.reset}\n`);

  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}ERROR FATAL:${colors.reset}`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
migrateTubesData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error inesperado:', error);
    process.exit(1);
  });

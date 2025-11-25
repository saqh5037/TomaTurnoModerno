/**
 * Script de Migración: Convertir campo studies de String a Json
 * Sistema TomaTurnoModerno - INER
 *
 * Este script migra los datos existentes en el campo `studies` (String)
 * al nuevo campo `studies_json` (Json) con formato estructurado.
 *
 * Uso:
 *   node scripts/migrate-studies-to-structured-format.js [opciones]
 *
 * Opciones:
 *   --dry-run          Simular migración sin aplicar cambios
 *   --limit N          Procesar solo N registros (para pruebas)
 *   --status STATUS    Filtrar por status (ej: "Pending", "In Progress")
 *   --verbose          Mostrar detalles de cada registro
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Parsear argumentos de línea de comandos
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');
const limitIndex = args.indexOf('--limit');
const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : null;
const statusIndex = args.indexOf('--status');
const statusFilter = statusIndex !== -1 ? args[statusIndex + 1] : null;

console.log('\n===========================================');
console.log('MIGRACIÓN: studies (String) → studies_json (Json)');
console.log('===========================================\n');

if (isDryRun) {
  console.log('⚠️  MODO DRY-RUN: No se aplicarán cambios reales\n');
}

/**
 * Parsear studies desde formato String a array
 * @param {string} studiesStr - String con JSON o texto
 * @returns {Array} Array de estudios
 */
function parseStudiesString(studiesStr) {
  if (!studiesStr) {
    return [];
  }

  // Si es un string vacío o "[]"
  if (studiesStr.trim() === '' || studiesStr.trim() === '[]') {
    return [];
  }

  try {
    // Intentar parsear como JSON
    const parsed = JSON.parse(studiesStr);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    // Si es un objeto, convertir a array
    if (typeof parsed === 'object') {
      return [parsed];
    }

    // Si es string simple, retornar como array de un elemento
    if (typeof parsed === 'string') {
      return [parsed];
    }

    return [];
  } catch (error) {
    // Si no es JSON válido, tratar como string simple
    console.warn(`  ⚠️  No se pudo parsear JSON: "${studiesStr.substring(0, 50)}..."`);

    // Intentar dividir por comas o saltos de línea
    if (studiesStr.includes(',')) {
      return studiesStr.split(',').map(s => s.trim()).filter(s => s);
    }

    // Retornar como un solo estudio
    return [studiesStr.trim()];
  }
}

/**
 * Convertir estudios a formato estructurado
 * @param {Array} studies - Array de estudios (strings u objetos)
 * @returns {Array} Array de estudios estructurados
 */
function convertToStructuredFormat(studies) {
  if (!Array.isArray(studies)) {
    return [];
  }

  return studies.map(study => {
    // Si ya es un objeto estructurado, retornarlo
    if (typeof study === 'object' && study !== null) {
      return {
        id: study.id || null,
        code: study.code || null,
        name: study.name || study.nombre || 'Estudio sin nombre',
        category: study.category || study.categoria || null,
        container: study.container || null,
        sample: study.sample || null
      };
    }

    // Si es string, convertir a objeto básico
    if (typeof study === 'string') {
      return {
        id: null,
        code: null,
        name: study,
        category: null,
        container: null,
        sample: null
      };
    }

    // Caso inesperado
    return {
      id: null,
      code: null,
      name: 'Estudio desconocido',
      category: null,
      container: null,
      sample: null
    };
  });
}

/**
 * Migrar un registro individual
 * @param {Object} turnRequest - Registro de TurnRequest
 * @returns {Object} Resultado de la migración
 */
async function migrateTurnRequest(turnRequest) {
  try {
    // 1. Parsear studies actual (String)
    const parsedStudies = parseStudiesString(turnRequest.studies);

    if (isVerbose) {
      console.log(`  📄 Turno #${turnRequest.id}: ${parsedStudies.length} estudios`);
      console.log(`     Original: "${turnRequest.studies.substring(0, 100)}..."`);
    }

    // 2. Convertir a formato estructurado
    const structuredStudies = convertToStructuredFormat(parsedStudies);

    if (isVerbose) {
      console.log(`     Convertido: ${JSON.stringify(structuredStudies[0] || {}).substring(0, 100)}...`);
    }

    // 3. Si no es dry-run, actualizar en base de datos
    if (!isDryRun) {
      await prisma.turnRequest.update({
        where: { id: turnRequest.id },
        data: {
          studies_json: structuredStudies
        }
      });
    }

    return {
      success: true,
      turnId: turnRequest.id,
      studiesCount: structuredStudies.length
    };
  } catch (error) {
    console.error(`  ❌ Error migrando turno #${turnRequest.id}:`, error.message);
    return {
      success: false,
      turnId: turnRequest.id,
      error: error.message
    };
  }
}

/**
 * Función principal de migración
 */
async function main() {
  try {
    // 1. Contar total de registros
    const whereClause = statusFilter ? { status: statusFilter } : {};
    const totalRecords = await prisma.turnRequest.count({ where: whereClause });

    console.log(`📊 Total de registros a migrar: ${totalRecords}`);

    if (statusFilter) {
      console.log(`   Filtro: status = "${statusFilter}"`);
    }

    if (limit) {
      console.log(`   Límite: ${limit} registros`);
    }

    console.log('');

    // 2. Obtener registros a migrar
    const turnsToMigrate = await prisma.turnRequest.findMany({
      where: whereClause,
      take: limit || undefined,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        studies: true,
        studies_json: true,
        patientName: true,
        createdAt: true
      }
    });

    console.log(`📥 Registros obtenidos: ${turnsToMigrate.length}\n`);

    // 3. Estadísticas previas
    const alreadyMigrated = turnsToMigrate.filter(t => t.studies_json !== null).length;
    const needsMigration = turnsToMigrate.length - alreadyMigrated;

    console.log(`✅ Ya migrados: ${alreadyMigrated}`);
    console.log(`⏳ Pendientes de migrar: ${needsMigration}\n`);

    if (needsMigration === 0) {
      console.log('✨ ¡Todos los registros ya están migrados!');
      return;
    }

    // 4. Migrar registros
    console.log('🔄 Iniciando migración...\n');

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    for (const turn of turnsToMigrate) {
      // Saltar si ya está migrado
      if (turn.studies_json !== null) {
        results.skipped++;
        if (isVerbose) {
          console.log(`  ⏭️  Turno #${turn.id}: Ya migrado`);
        }
        continue;
      }

      // Migrar
      const result = await migrateTurnRequest(turn);

      if (result.success) {
        results.success++;
        if (!isVerbose) {
          process.stdout.write('.');
        }
      } else {
        results.failed++;
        results.errors.push({
          turnId: result.turnId,
          error: result.error
        });
      }
    }

    console.log('\n');

    // 5. Resumen final
    console.log('\n===========================================');
    console.log('RESUMEN DE MIGRACIÓN');
    console.log('===========================================\n');

    console.log(`✅ Exitosos: ${results.success}`);
    console.log(`❌ Fallidos: ${results.failed}`);
    console.log(`⏭️  Omitidos (ya migrados): ${results.skipped}`);
    console.log(`📊 Total procesados: ${turnsToMigrate.length}\n`);

    if (results.errors.length > 0) {
      console.log('❌ ERRORES ENCONTRADOS:\n');
      results.errors.forEach(err => {
        console.log(`   Turno #${err.turnId}: ${err.error}`);
      });
      console.log('');
    }

    if (isDryRun) {
      console.log('⚠️  MODO DRY-RUN: No se aplicaron cambios reales');
      console.log('   Ejecuta sin --dry-run para aplicar la migración\n');
    } else {
      console.log('✨ ¡Migración completada!\n');
    }

    // 6. Verificación post-migración (solo si no es dry-run)
    if (!isDryRun && results.success > 0) {
      console.log('🔍 Verificando integridad...\n');

      const verificationRecords = await prisma.turnRequest.findMany({
        where: {
          ...whereClause,
          studies_json: { not: null }
        },
        take: 5,
        select: {
          id: true,
          studies: true,
          studies_json: true
        }
      });

      console.log('📋 Muestra de registros migrados:\n');
      verificationRecords.forEach(record => {
        const jsonCount = Array.isArray(record.studies_json) ? record.studies_json.length : 0;
        console.log(`   Turno #${record.id}: ${jsonCount} estudios estructurados`);
      });

      console.log('\n✅ Verificación completada\n');
    }

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
console.log('🚀 Iniciando script de migración...\n');
main()
  .then(() => {
    console.log('👋 Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error inesperado:', error);
    process.exit(1);
  });

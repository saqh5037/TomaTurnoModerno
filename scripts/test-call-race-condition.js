/**
 * Test de Race Condition para /api/attention/call
 *
 * Este script simula múltiples flebotomistas intentando tomar el mismo turno
 * simultáneamente. Solo UNO debería tener éxito.
 *
 * Uso: node scripts/test-call-race-condition.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Configuración de la prueba
const NUM_CONCURRENT_REQUESTS = 10;
const USER_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // IDs de usuarios simulados
const CUBICLE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // IDs de cubículos

async function createTestTurn() {
  console.log('\n📝 Creando turno de prueba...');

  const response = await fetch(`${BASE_URL}/api/turns/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientName: `TEST-RACE-${Date.now()}`,
      age: 30,
      gender: 'M',
      studies: ['Test Study'],
      tubesRequired: 1,
      tipoAtencion: 'General'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error creando turno: ${error}`);
  }

  const data = await response.json();
  // El endpoint devuelve assignedTurn que es el ID
  console.log(`✅ Turno creado: ID=${data.assignedTurn}, Tipo=${data.tipoAtencion}`);
  return { id: data.assignedTurn, ...data };
}

async function callTurn(turnId, userId, cubicleId, requestIndex) {
  const startTime = Date.now();

  try {
    const response = await fetch(`${BASE_URL}/api/attention/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        turnId,
        userId,
        cubicleId
      })
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    return {
      requestIndex,
      userId,
      status: response.status,
      success: response.ok,
      duration,
      data,
      error: response.ok ? null : (data.error || data.code)
    };
  } catch (error) {
    return {
      requestIndex,
      userId,
      status: 0,
      success: false,
      duration: Date.now() - startTime,
      data: null,
      error: error.message
    };
  }
}

async function runRaceConditionTest() {
  console.log('🔬 TEST DE RACE CONDITION - /api/attention/call');
  console.log('='.repeat(60));
  console.log(`📊 Configuración:`);
  console.log(`   - Requests concurrentes: ${NUM_CONCURRENT_REQUESTS}`);
  console.log(`   - URL base: ${BASE_URL}`);
  console.log('='.repeat(60));

  // Crear turno de prueba
  let testTurn;
  try {
    testTurn = await createTestTurn();
  } catch (error) {
    console.error('❌ Error creando turno de prueba:', error.message);
    console.log('\n⚠️  Asegúrate de que el servidor esté corriendo en', BASE_URL);
    process.exit(1);
  }

  // Esperar un momento para que el turno se propague
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log(`\n🚀 Lanzando ${NUM_CONCURRENT_REQUESTS} requests simultáneas al turno ${testTurn.id}...`);
  console.log('-'.repeat(60));

  // Crear todas las promesas de llamada simultáneamente
  const promises = [];
  for (let i = 0; i < NUM_CONCURRENT_REQUESTS; i++) {
    promises.push(callTurn(testTurn.id, USER_IDS[i], CUBICLE_IDS[i], i + 1));
  }

  // Ejecutar todas las llamadas al mismo tiempo
  const startTime = Date.now();
  const results = await Promise.all(promises);
  const totalDuration = Date.now() - startTime;

  // Analizar resultados
  console.log('\n📈 RESULTADOS:');
  console.log('-'.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  // Mostrar cada resultado
  results.forEach(r => {
    const icon = r.success ? '✅' : '❌';
    const statusText = r.success ? 'SUCCESS' : `FAILED (${r.status})`;
    console.log(`${icon} Request #${r.requestIndex} (User ${r.userId}): ${statusText} - ${r.duration}ms`);
    if (!r.success && r.error) {
      console.log(`   └─ Error: ${r.error}`);
    }
  });

  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN:');
  console.log(`   ✅ Exitosas: ${successful.length}`);
  console.log(`   ❌ Fallidas: ${failed.length}`);
  console.log(`   ⏱️  Tiempo total: ${totalDuration}ms`);

  // Verificar que EXACTAMENTE 1 tuvo éxito
  if (successful.length === 1) {
    console.log('\n🎉 ¡PRUEBA EXITOSA!');
    console.log(`   Solo el usuario ${successful[0].userId} pudo tomar el turno.`);
    console.log('   La protección contra race condition está funcionando correctamente.');

    // Verificar códigos de error de los fallidos
    const has409 = failed.some(r => r.status === 409);
    const has400 = failed.some(r => r.status === 400);

    if (has409 || has400) {
      console.log('\n   Códigos de error recibidos:');
      const errorCounts = {};
      failed.forEach(r => {
        const key = `${r.status} (${r.error})`;
        errorCounts[key] = (errorCounts[key] || 0) + 1;
      });
      Object.entries(errorCounts).forEach(([key, count]) => {
        console.log(`   - ${key}: ${count} veces`);
      });
    }

    return true;
  } else if (successful.length === 0) {
    console.log('\n⚠️  PRUEBA FALLIDA: Ningún request tuvo éxito.');
    console.log('   Esto puede indicar un problema con la configuración del test.');
    return false;
  } else {
    console.log('\n❌ ¡PRUEBA FALLIDA!');
    console.log(`   ${successful.length} usuarios pudieron tomar el mismo turno.`);
    console.log('   ¡HAY UNA RACE CONDITION!');
    console.log('\n   Usuarios que tomaron el turno:');
    successful.forEach(r => {
      console.log(`   - Usuario ${r.userId} (Request #${r.requestIndex})`);
    });
    return false;
  }
}

async function runMultipleTests(numTests = 5) {
  console.log('\n🔁 Ejecutando múltiples rondas de prueba...\n');

  let passed = 0;
  let failed = 0;

  for (let i = 1; i <= numTests; i++) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`RONDA ${i} de ${numTests}`);
    console.log(`${'═'.repeat(60)}`);

    const success = await runRaceConditionTest();
    if (success) {
      passed++;
    } else {
      failed++;
    }

    // Pequeña pausa entre tests
    if (i < numTests) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 RESULTADO FINAL DE TODAS LAS RONDAS');
  console.log('═'.repeat(60));
  console.log(`   ✅ Rondas exitosas: ${passed}/${numTests}`);
  console.log(`   ❌ Rondas fallidas: ${failed}/${numTests}`);

  if (failed === 0) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON!');
    console.log('   La protección contra race condition es robusta.');
  } else {
    console.log('\n⚠️  ALGUNAS PRUEBAS FALLARON');
    console.log('   Revisar la implementación de la transacción.');
  }

  return failed === 0;
}

// Ejecutar
const numRounds = parseInt(process.argv[2]) || 5;
runMultipleTests(numRounds)
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });

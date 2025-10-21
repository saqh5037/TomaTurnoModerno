/**
 * Script para probar el ordenamiento correcto de pacientes diferidos
 *
 * Escenario de prueba:
 * 1. Crear paciente A, B, C (estado inicial)
 * 2. Llamar al paciente A
 * 3. Diferir paciente A → debe ir al final: B, C, A
 * 4. Agregar nuevo paciente D → debe quedar: B, C, A, D
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3005';

// Token de autenticación (debes obtenerlo de tu sesión)
let authToken = null;

async function login() {
  try {
    const response = await axios.post(`${API_BASE}/api/auth/login`, {
      username: 'admin',
      password: 'Admin2024!'
    });
    authToken = response.data.token;
    console.log('✅ Login exitoso');
    return authToken;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

async function createPatient(name, tipoAtencion = 'General') {
  try {
    const response = await axios.post(
      `${API_BASE}/api/turns/create`,
      {
        patientName: name,
        age: 30,
        gender: 'Masculino',
        studies: [],
        tipoAtencion: tipoAtencion
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log(`✅ Paciente creado: ${name} (ID: ${response.data.turn.id}, Turno: ${response.data.turn.assignedTurn})`);
    return response.data.turn;
  } catch (error) {
    console.error(`❌ Error creando paciente ${name}:`, error.response?.data || error.message);
    throw error;
  }
}

async function callPatient(turnId, cubicleId) {
  try {
    const response = await axios.post(
      `${API_BASE}/api/queue/updateCall`,
      {
        turnId: turnId,
        isCalled: false, // false = solo llamar, no marcar como atendido
        cubicleId: cubicleId
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log(`✅ Paciente ${turnId} llamado a cubículo ${cubicleId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error llamando paciente ${turnId}:`, error.response?.data || error.message);
    throw error;
  }
}

async function deferPatient(turnId) {
  try {
    const response = await axios.post(
      `${API_BASE}/api/queue/defer`,
      {
        turnId: turnId
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log(`✅ Paciente ${turnId} diferido (devuelto a cola)`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error difiriendo paciente ${turnId}:`, error.response?.data || error.message);
    throw error;
  }
}

async function getQueueStatus() {
  try {
    const response = await axios.get(`${API_BASE}/api/queue/list`);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo estado de cola:', error.response?.data || error.message);
    throw error;
  }
}

function printQueue(queueData) {
  console.log('\n📋 Estado actual de la cola:');
  console.log('\n🟡 PACIENTES EN ESPERA:');
  if (queueData.pendingTurns.length === 0) {
    console.log('   (vacía)');
  } else {
    queueData.pendingTurns.forEach((turn, index) => {
      const deferredMark = turn.isDeferred ? '🔄 [DIFERIDO]' : '';
      console.log(`   ${index + 1}. ${turn.patientName} (Turno: ${turn.assignedTurn}) ${deferredMark}`);
    });
  }
  console.log('');
}

async function runTest() {
  console.log('🚀 Iniciando prueba de ordenamiento de pacientes diferidos\n');

  try {
    // 1. Login
    await login();

    // 2. Verificar estado inicial
    console.log('\n📊 PASO 1: Estado inicial de la cola');
    let queue = await getQueueStatus();
    printQueue(queue);

    // 3. Crear pacientes A, B, C
    console.log('\n📊 PASO 2: Crear 3 pacientes nuevos (A, B, C)');
    const patientA = await createPatient('Test A - Deferred');
    const patientB = await createPatient('Test B - Normal');
    const patientC = await createPatient('Test C - Normal');

    await new Promise(resolve => setTimeout(resolve, 1000));
    queue = await getQueueStatus();
    printQueue(queue);

    // 4. Llamar al paciente A
    console.log('\n📊 PASO 3: Llamar al paciente A');
    await callPatient(patientA.id, 2); // Cubículo 2

    await new Promise(resolve => setTimeout(resolve, 1000));
    queue = await getQueueStatus();
    printQueue(queue);

    // 5. Diferir al paciente A
    console.log('\n📊 PASO 4: Diferir paciente A (devolver a cola)');
    await deferPatient(patientA.id);

    await new Promise(resolve => setTimeout(resolve, 1000));
    queue = await getQueueStatus();
    console.log('   ⚠️ ESPERADO: B, C, A (A debe estar al final)');
    printQueue(queue);

    // 6. Crear nuevo paciente D
    console.log('\n📊 PASO 5: Agregar nuevo paciente D');
    const patientD = await createPatient('Test D - After Deferred');

    await new Promise(resolve => setTimeout(resolve, 1000));
    queue = await getQueueStatus();
    console.log('   ⚠️ ESPERADO: B, C, A, D (D debe quedar después de A diferido)');
    printQueue(queue);

    // 7. Verificar orden con query SQL
    console.log('\n📊 PASO 6: Verificación en base de datos');
    const { exec } = require('child_process');
    exec(
      `psql postgresql://labsis:labsis@localhost:5432/toma_turno -c "SELECT id, \\"patientName\\", \\"assignedTurn\\", \\"isDeferred\\", \\"deferredAt\\", \\"createdAt\\" FROM \\"TurnRequest\\" WHERE id IN (${patientA.id}, ${patientB.id}, ${patientC.id}, ${patientD.id}) ORDER BY \\"deferredAt\\" ASC NULLS FIRST, \\"createdAt\\" ASC;"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error ejecutando query:', error);
          return;
        }
        console.log(stdout);
        console.log('\n✅ Prueba completada!');
        console.log('\n📝 Resumen:');
        console.log('   - Si A tiene deferredAt NOT NULL y B, C, D tienen NULL');
        console.log('   - Y el orden es B, C, A, D');
        console.log('   - Entonces el sistema funciona correctamente! 🎉');
      }
    );

  } catch (error) {
    console.error('\n❌ Error en la prueba:', error.message);
    process.exit(1);
  }
}

runTest();

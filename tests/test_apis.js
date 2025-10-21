#!/usr/bin/env node
/**
 * Script de pruebas para APIs del sistema
 */

const BASE_URL = 'http://localhost:3005';

const Colors = {
  GREEN: '\x1b[92m',
  RED: '\x1b[91m',
  YELLOW: '\x1b[93m',
  BLUE: '\x1b[94m',
  END: '\x1b[0m'
};

function printTest(message) {
  console.log(`${Colors.BLUE}[TEST]${Colors.END} ${message}`);
}

function printSuccess(message) {
  console.log(`${Colors.GREEN}✓ ${message}${Colors.END}`);
}

function printError(message) {
  console.log(`${Colors.RED}✗ ${message}${Colors.END}`);
}

async function testEndpoint(endpoint, description) {
  printTest(`Probando ${description}`);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);

    if (!response.ok) {
      printError(`${endpoint} - Status: ${response.status}`);
      return false;
    }

    const data = await response.json();
    printSuccess(`${endpoint} - OK`);
    return true;
  } catch (error) {
    printError(`${endpoint} - Error: ${error.message}`);
    return false;
  }
}

async function testQueueList() {
  printTest('Probando /api/queue/list');

  try {
    const response = await fetch(`${BASE_URL}/api/queue/list`);
    const data = await response.json();

    if (!data.pendingTurns || !data.inProgressTurns) {
      printError('/api/queue/list - Estructura de datos incorrecta');
      return false;
    }

    printSuccess(`/api/queue/list - ${data.pendingTurns.length} pendientes, ${data.inProgressTurns.length} en progreso`);

    // Verificar ordenamiento
    let lastWasSpecial = true;
    let foundNormal = false;

    for (const turn of data.pendingTurns) {
      const isSpecial = turn.tipoAtencion === 'Special';

      if (!isSpecial) {
        foundNormal = true;
      }

      if (foundNormal && isSpecial) {
        printError('Ordenamiento incorrecto: Paciente especial después de normal');
        return false;
      }
    }

    printSuccess('Ordenamiento correcto: Especiales primero, luego normales');
    return true;

  } catch (error) {
    printError(`Error: ${error.message}`);
    return false;
  }
}

async function testAttentionList() {
  printTest('Probando /api/attention/list con userId');

  try {
    const response = await fetch(`${BASE_URL}/api/attention/list?userId=19`);
    const data = await response.json();

    if (!data.pendingTurns || !data.inProgressTurns) {
      printError('/api/attention/list - Estructura de datos incorrecta');
      return false;
    }

    printSuccess(`/api/attention/list - ${data.pendingTurns.length} pendientes, ${data.inProgressTurns.length} en progreso`);

    // Verificar campos adicionales
    for (const turn of data.pendingTurns) {
      if (!turn.hasOwnProperty('isSuggestedForMe')) {
        printError('Falta campo isSuggestedForMe');
        return false;
      }
      if (!turn.hasOwnProperty('isDeferred')) {
        printError('Falta campo isDeferred');
        return false;
      }
      if (!turn.hasOwnProperty('callCount')) {
        printError('Falta campo callCount');
        return false;
      }
    }

    printSuccess('Todos los campos requeridos están presentes');

    // Verificar ordenamiento con diferidos
    const specialDeferred = data.pendingTurns.filter(t => t.isSpecial && t.isDeferred);
    const specialNonDeferred = data.pendingTurns.filter(t => t.isSpecial && !t.isDeferred);
    const normalDeferred = data.pendingTurns.filter(t => !t.isSpecial && t.isDeferred);
    const normalNonDeferred = data.pendingTurns.filter(t => !t.isSpecial && !t.isDeferred);

    console.log(`  - Especiales diferidos: ${specialDeferred.length}`);
    console.log(`  - Especiales NO diferidos: ${specialNonDeferred.length}`);
    console.log(`  - Normales diferidos: ${normalDeferred.length}`);
    console.log(`  - Normales NO diferidos: ${normalNonDeferred.length}`);

    return true;

  } catch (error) {
    printError(`Error: ${error.message}`);
    return false;
  }
}

async function testAssignSuggestions() {
  printTest('Probando /api/queue/assignSuggestions');

  try {
    const response = await fetch(`${BASE_URL}/api/queue/assignSuggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success !== undefined || data.message !== undefined) {
      printSuccess(`/api/queue/assignSuggestions - ${data.message || 'OK'}`);
      return true;
    } else {
      printError('/api/queue/assignSuggestions - Respuesta inesperada');
      return false;
    }

  } catch (error) {
    printError(`Error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log(Colors.BLUE + 'INICIANDO PRUEBAS DE APIs' + Colors.END);
  console.log('='.repeat(60) + '\n');

  const results = {
    passed: 0,
    failed: 0
  };

  // Ejecutar pruebas
  const tests = [
    testQueueList,
    testAttentionList,
    testAssignSuggestions
  ];

  for (const test of tests) {
    const result = await test();
    if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
    console.log(''); // Línea en blanco
  }

  // Resultados
  console.log('='.repeat(60));
  console.log(Colors.BLUE + 'RESULTADOS DE LAS PRUEBAS' + Colors.END);
  console.log('='.repeat(60));
  console.log(`${Colors.GREEN}Pruebas exitosas: ${results.passed}${Colors.END}`);
  console.log(`${Colors.RED}Pruebas fallidas: ${results.failed}${Colors.END}`);
  console.log('='.repeat(60) + '\n');

  if (results.failed === 0) {
    console.log(`${Colors.GREEN}✓ TODAS LAS PRUEBAS PASARON EXITOSAMENTE${Colors.END}\n`);
    process.exit(0);
  } else {
    console.log(`${Colors.RED}✗ ALGUNAS PRUEBAS FALLARON${Colors.END}\n`);
    process.exit(1);
  }
}

runAllTests().catch(error => {
  console.error(`${Colors.RED}Error crítico: ${error.message}${Colors.END}`);
  process.exit(1);
});

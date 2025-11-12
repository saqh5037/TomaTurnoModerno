#!/usr/bin/env node

/**
 * Suite Exhaustiva de Tests de API - TomaTurno v2.6.2
 *
 * Tests completos de todas las rutas API críticas del sistema
 * incluyendo validación del fix UTF-8 y validación Zod
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3005';
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin' };

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Estado global de los tests
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: [],
  timings: [],
};

let authToken = null;
let testCubicleId = null;
let testTurnId = null;
let testUserId = null;

/**
 * Función auxiliar para hacer requests HTTP
 */
async function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...headers,
      },
    };

    if (authToken && !headers.Authorization) {
      options.headers.Cookie = authToken;
    }

    const startTime = Date.now();
    const req = http.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - startTime;

        let parsedData;
        try {
          parsedData = data ? JSON.parse(data) : null;
        } catch (e) {
          parsedData = data;
        }

        // Guardar cookies si existen
        if (res.headers['set-cookie']) {
          authToken = res.headers['set-cookie'].join('; ');
        }

        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsedData,
          raw: data,
          duration,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Función para ejecutar un test
 */
async function test(name, fn, category = 'General') {
  testResults.total++;
  process.stdout.write(`  ${colors.cyan}→${colors.reset} ${name}... `);

  const startTime = Date.now();

  try {
    await fn();
    const duration = Date.now() - startTime;

    testResults.passed++;
    testResults.timings.push({ name, duration, category });

    console.log(`${colors.green}✓${colors.reset} ${colors.green}PASS${colors.reset} (${duration}ms)`);
    return true;
  } catch (error) {
    const duration = Date.now() - startTime;

    testResults.failed++;
    testResults.errors.push({ name, error: error.message, category });

    console.log(`${colors.red}✗${colors.reset} ${colors.red}FAIL${colors.reset} (${duration}ms)`);
    console.log(`    ${colors.red}Error:${colors.reset} ${error.message}`);
    return false;
  }
}

/**
 * Assertion helpers
 */
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertTrue(value, message) {
  if (!value) {
    throw new Error(message || `Expected true, got ${value}`);
  }
}

function assertStatus(response, expectedStatus) {
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus}, got ${response.status}. Response: ${JSON.stringify(response.data)}`
    );
  }
}

function assertHasProperty(obj, prop) {
  if (!obj.hasOwnProperty(prop)) {
    throw new Error(`Expected object to have property '${prop}'`);
  }
}

function assertResponseTime(duration, maxMs) {
  if (duration > maxMs) {
    throw new Error(`Response time ${duration}ms exceeded limit of ${maxMs}ms`);
  }
}

/**
 * TESTS DE HEALTH CHECK
 */
async function runHealthTests() {
  console.log(`\n${colors.bright}${colors.blue}━━━ HEALTH CHECK TESTS ━━━${colors.reset}`);

  await test('GET /api/health - debe retornar status healthy', async () => {
    const res = await request('GET', '/api/health');
    assertStatus(res, 200);
    assertEqual(res.data.status, 'healthy');
    assertHasProperty(res.data, 'database');
    assertEqual(res.data.database.status, 'connected');
    assertResponseTime(res.duration, 200); // Debe responder en < 200ms
  }, 'Health');
}

/**
 * TESTS DE AUTENTICACIÓN
 */
async function runAuthTests() {
  console.log(`\n${colors.bright}${colors.blue}━━━ AUTHENTICATION TESTS ━━━${colors.reset}`);

  await test('POST /api/auth/login - credenciales válidas', async () => {
    const res = await request('POST', '/api/auth/login', ADMIN_CREDENTIALS);
    assertStatus(res, 200);
    assertHasProperty(res.data, 'user');
    assertEqual(res.data.user.username, 'admin');
    assertTrue(authToken !== null, 'Debe establecer cookie de auth');
  }, 'Auth');

  await test('POST /api/auth/login - credenciales inválidas', async () => {
    const res = await request('POST', '/api/auth/login', {
      username: 'admin',
      password: 'wrongpassword',
    });
    assertStatus(res, 401);
  }, 'Auth');

  await test('GET /api/auth/verify - token válido', async () => {
    const res = await request('GET', '/api/auth/verify');
    assertStatus(res, 200);
    assertHasProperty(res.data, 'user');
  }, 'Auth');
}

/**
 * TESTS DE TURNOS (CRÍTICO - UTF-8)
 */
async function runTurnsTests() {
  console.log(`\n${colors.bright}${colors.blue}━━━ TURNS API TESTS (UTF-8 CRITICAL) ━━━${colors.reset}`);

  await test('POST /api/turns/create - turno con nombre normal', async () => {
    const res = await request('POST', '/api/turns/create', {
      patientName: 'Juan Perez',
      age: 30,
      gender: 'M',
      contactInfo: '555-1234',
      studies: ['Hemograma'],
      tubesRequired: 2,
      tipoAtencion: 'General',
    });
    assertStatus(res, 201);
    assertHasProperty(res.data, 'assignedTurn');
    testTurnId = res.data.assignedTurn;
  }, 'Turns');

  await test('POST /api/turns/create - turno con caracteres UTF-8 (ñ, ü, á, é, í, ó, ú)', async () => {
    const res = await request('POST', '/api/turns/create', {
      patientName: 'María Pérez Núñez',
      age: 25,
      gender: 'F',
      contactInfo: '555-5678',
      studies: ['Química Sanguínea', 'Perfil Lipídico'],
      tubesRequired: 3,
      observations: 'Paciente con síntomas de fatiga. Requiere análisis específico.',
      tipoAtencion: 'General',
    });
    assertStatus(res, 201);
    assertHasProperty(res.data, 'assignedTurn');
  }, 'Turns');

  await test('POST /api/turns/create - nombre con todos los caracteres especiales', async () => {
    const res = await request('POST', '/api/turns/create', {
      patientName: 'José Ángel Müller Señoráns',
      age: 40,
      gender: 'M',
      contactInfo: '555-9999',
      studies: ['Hemograma Completo'],
      tubesRequired: 2,
      observations: 'Niño de 10 años con ñoñerías y artículos únicos',
      clinicalInfo: 'Información clínica: médico recomienda análisis específicos',
      tipoAtencion: 'Special',
    });
    assertStatus(res, 201);
    assertEqual(res.data.tipoAtencion, 'Special');
  }, 'Turns');

  await test('POST /api/turns/create - validación Zod: datos inválidos', async () => {
    const res = await request('POST', '/api/turns/create', {
      patientName: '',  // Inválido: vacío
      age: 200,         // Inválido: > 150
      gender: 'X',      // Inválido: no está en enum
    });
    assertStatus(res, 400);
    assertHasProperty(res.data, 'error');
    assertEqual(res.data.error, 'Datos inválidos');
    assertHasProperty(res.data, 'details');
    assertTrue(Array.isArray(res.data.details), 'Details debe ser un array');
  }, 'Turns');

  await test('GET /api/turns/queue - listar cola de turnos', async () => {
    const res = await request('GET', '/api/turns/queue');
    assertStatus(res, 200);
    assertTrue(Array.isArray(res.data), 'Debe retornar un array');
  }, 'Turns');
}

/**
 * TESTS DE CUBÍCULOS
 */
async function runCubiclesTests() {
  console.log(`\n${colors.bright}${colors.blue}━━━ CUBICLES API TESTS ━━━${colors.reset}`);

  await test('GET /api/cubicles - listar todos los cubículos', async () => {
    const res = await request('GET', '/api/cubicles');
    assertStatus(res, 200);
    assertTrue(Array.isArray(res.data), 'Debe retornar un array');
    if (res.data.length > 0) {
      testCubicleId = res.data[0].id;
    }
  }, 'Cubicles');

  await test('GET /api/cubicles/status - estado de cubículos', async () => {
    const res = await request('GET', '/api/cubicles/status');
    assertStatus(res, 200);
    assertHasProperty(res.data, 'success');
    assertTrue(Array.isArray(res.data.data), 'Debe retornar data como array');
  }, 'Cubicles');

  if (testCubicleId) {
    await test(`GET /api/cubicles/${testCubicleId} - obtener cubículo específico`, async () => {
      const res = await request('GET', `/api/cubicles/${testCubicleId}`);
      assertStatus(res, 200);
      assertEqual(res.data.id, testCubicleId);
    }, 'Cubicles');
  }
}

/**
 * TESTS DE COLA Y ATENCIÓN
 */
async function runQueueTests() {
  console.log(`\n${colors.bright}${colors.blue}━━━ QUEUE & ATTENTION TESTS ━━━${colors.reset}`);

  await test('GET /api/queue/list - listar cola con sesión', async () => {
    const res = await request('GET', '/api/queue/list');
    assertStatus(res, 200);
    assertTrue(Array.isArray(res.data), 'Debe retornar un array');
  }, 'Queue');

  await test('GET /api/attention/list - listar pacientes en atención', async () => {
    const res = await request('GET', '/api/attention/list');
    assertStatus(res, 200);
    assertTrue(Array.isArray(res.data), 'Debe retornar un array');
  }, 'Queue');
}

/**
 * TESTS DE ESTADÍSTICAS
 */
async function runStatisticsTests() {
  console.log(`\n${colors.bright}${colors.blue}━━━ STATISTICS API TESTS ━━━${colors.reset}`);

  await test('GET /api/statistics/dashboard - dashboard principal', async () => {
    const res = await request('GET', '/api/statistics/dashboard');
    assertStatus(res, 200);
    assertHasProperty(res.data, 'totalTurns');
  }, 'Statistics');

  await test('GET /api/statistics/daily - estadísticas diarias', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request('GET', `/api/statistics/daily?date=${today}`);
    assertStatus(res, 200);
  }, 'Statistics');

  await test('GET /api/statistics/monthly - estadísticas mensuales', async () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const res = await request('GET', `/api/statistics/monthly?year=${year}&month=${month}`);
    assertStatus(res, 200);
  }, 'Statistics');

  await test('GET /api/statistics/phlebotomists - rendimiento flebotomistas', async () => {
    const res = await request('GET', '/api/statistics/phlebotomists');
    assertStatus(res, 200);
  }, 'Statistics');
}

/**
 * TESTS DE USUARIOS
 */
async function runUsersTests() {
  console.log(`\n${colors.bright}${colors.blue}━━━ USERS API TESTS ━━━${colors.reset}`);

  await test('GET /api/users - listar usuarios', async () => {
    const res = await request('GET', '/api/users');
    assertStatus(res, 200);
    assertTrue(Array.isArray(res.data), 'Debe retornar un array');
  }, 'Users');

  await test('GET /api/users/analytics - analytics de usuarios', async () => {
    const res = await request('GET', '/api/users/analytics');
    assertStatus(res, 200);
  }, 'Users');
}

/**
 * TESTS DE PERFORMANCE
 */
async function runPerformanceTests() {
  console.log(`\n${colors.bright}${colors.blue}━━━ PERFORMANCE TESTS ━━━${colors.reset}`);

  await test('Performance - Health endpoint < 100ms', async () => {
    const res = await request('GET', '/api/health');
    assertResponseTime(res.duration, 100);
  }, 'Performance');

  await test('Performance - Auth login < 300ms', async () => {
    const res = await request('POST', '/api/auth/login', ADMIN_CREDENTIALS);
    assertResponseTime(res.duration, 300);
  }, 'Performance');

  await test('Performance - Dashboard < 500ms', async () => {
    const res = await request('GET', '/api/statistics/dashboard');
    assertResponseTime(res.duration, 500);
  }, 'Performance');
}

/**
 * Generar reporte final
 */
function generateReport() {
  console.log(`\n${colors.bright}${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}           TEST RESULTS SUMMARY           ${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(2);

  console.log(`  Total Tests:  ${colors.bright}${testResults.total}${colors.reset}`);
  console.log(`  ${colors.green}✓ Passed:${colors.reset}     ${colors.bright}${testResults.passed}${colors.reset}`);
  console.log(`  ${colors.red}✗ Failed:${colors.reset}     ${colors.bright}${testResults.failed}${colors.reset}`);
  console.log(`  ${colors.yellow}○ Skipped:${colors.reset}    ${colors.bright}${testResults.skipped}${colors.reset}`);
  console.log(`  Pass Rate:    ${passRate >= 95 ? colors.green : colors.yellow}${passRate}%${colors.reset}\n`);

  // Agrupar tiempos por categoría
  const timingsByCategory = {};
  testResults.timings.forEach(({ category, duration }) => {
    if (!timingsByCategory[category]) {
      timingsByCategory[category] = [];
    }
    timingsByCategory[category].push(duration);
  });

  console.log(`${colors.bright}Performance by Category:${colors.reset}`);
  Object.keys(timingsByCategory).forEach((category) => {
    const times = timingsByCategory[category];
    const avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2);
    const max = Math.max(...times);
    const min = Math.min(...times);
    console.log(`  ${category.padEnd(15)} Avg: ${avg}ms  Min: ${min}ms  Max: ${max}ms`);
  });

  if (testResults.failed > 0) {
    console.log(`\n${colors.bright}${colors.red}Failed Tests:${colors.reset}`);
    testResults.errors.forEach(({ name, error, category }) => {
      console.log(`  ${colors.red}✗${colors.reset} [${category}] ${name}`);
      console.log(`    ${colors.red}→${colors.reset} ${error}`);
    });
  }

  console.log(`\n${colors.bright}${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Guardar reporte JSON
  const reportData = {
    timestamp: new Date().toISOString(),
    version: '2.6.2',
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      skipped: testResults.skipped,
      passRate: parseFloat(passRate),
    },
    timings: testResults.timings,
    errors: testResults.errors,
    timingsByCategory,
  };

  const fs = require('fs');
  const reportPath = __dirname + '/test-results.json';
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`${colors.green}✓${colors.reset} Reporte guardado en: ${reportPath}\n`);

  return testResults.failed === 0;
}

/**
 * Main execution
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}`);
  console.log(`╔═══════════════════════════════════════════════╗`);
  console.log(`║   QA EXHAUSTIVE API TESTS - TomaTurno v2.6.2  ║`);
  console.log(`╚═══════════════════════════════════════════════╝`);
  console.log(`${colors.reset}\n`);

  console.log(`${colors.yellow}⚡ Starting test suite...${colors.reset}`);
  console.log(`${colors.yellow}⚡ Base URL: ${BASE_URL}${colors.reset}\n`);

  try {
    // Ejecutar todas las suites
    await runHealthTests();
    await runAuthTests();
    await runTurnsTests();
    await runCubiclesTests();
    await runQueueTests();
    await runStatisticsTests();
    await runUsersTests();
    await runPerformanceTests();

    // Generar reporte
    const allPassed = generateReport();

    // Exit code
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error(`\n${colors.red}Fatal error:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Ejecutar
if (require.main === module) {
  main();
}

module.exports = { request, test, assertEqual, assertTrue, assertStatus };

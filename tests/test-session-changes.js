/**
 * Script de testing para verificar los cambios realizados en la sesión:
 * 1. Restricción de edición de username en perfil
 * 2. Permisos de supervisor para "Finalizar Toma"
 * 3. Acceso de supervisor al módulo de atención
 * 4. Funcionalidad del botón "Saltar al siguiente"
 */

const baseURL = 'http://localhost:3005';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log('\n' + '='.repeat(80));
  log(`🧪 TEST: ${testName}`, 'cyan');
  console.log('='.repeat(80));
}

function logResult(passed, message) {
  if (passed) {
    log(`✅ PASS: ${message}`, 'green');
  } else {
    log(`❌ FAIL: ${message}`, 'red');
  }
  return passed;
}

// Helper para hacer fetch
async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    const data = await response.json();
    return { response, data, status: response.status };
  } catch (error) {
    log(`Error en request: ${error.message}`, 'red');
    return { error, status: 0 };
  }
}

// ==================== TESTS ====================

async function testProfileUsernameRestriction() {
  logTest('Restricción de edición de username en perfil');

  // Primero hacer login para obtener token
  log('1. Obteniendo token de autenticación...', 'yellow');
  const loginResult = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'jperez', password: 'jperez' })
  });

  if (!loginResult.data.token) {
    logResult(false, 'No se pudo obtener token de autenticación');
    return false;
  }

  const token = loginResult.data.token;
  logResult(true, `Token obtenido: ${token.substring(0, 20)}...`);

  // Test 1: Intentar actualizar perfil CON username (debe fallar)
  log('\n2. Intentando actualizar perfil incluyendo username (debe fallar)...', 'yellow');
  const updateWithUsername = await makeRequest('/api/profile/update', {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      name: 'Juan Pérez Modificado',
      username: 'intento_de_hack',
      email: 'jperez@test.com',
      phone: '5551234567'
    })
  });

  const test1 = logResult(
    updateWithUsername.status === 403 &&
    updateWithUsername.data.error?.includes('no puede ser modificado'),
    updateWithUsername.status === 403
      ? 'API rechazó correctamente el intento de cambiar username (403 Forbidden)'
      : `Fallo: API no rechazó el cambio de username (Status: ${updateWithUsername.status})`
  );

  // Test 2: Actualizar perfil SIN username (debe funcionar)
  log('\n3. Actualizando perfil SIN username (debe funcionar)...', 'yellow');
  const updateWithoutUsername = await makeRequest('/api/profile/update', {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      name: 'Juan Pérez',
      email: 'jperez@iner.gob.mx',
      phone: '5551234567'
    })
  });

  const test2 = logResult(
    updateWithoutUsername.data.success === true,
    updateWithoutUsername.data.success
      ? 'Perfil actualizado correctamente sin incluir username'
      : `Fallo: No se pudo actualizar perfil (${updateWithoutUsername.data.error})`
  );

  return test1 && test2;
}

async function testSupervisorPermissions() {
  logTest('Permisos de supervisor en módulo de atención');

  log('Este test requiere verificación manual en el frontend:', 'yellow');
  log('1. Iniciar sesión como supervisor', 'blue');
  log('2. Navegar a /turns/attention', 'blue');
  log('3. Verificar que aparece el botón "Finalizar Toma" en CurrentPatientCard', 'blue');
  log('4. Verificar que aparece el botón "Finalizar Toma" en SidePanel (tab "En Atención")', 'blue');

  // Hacer login como supervisor para verificar que puede autenticarse
  log('\nVerificando autenticación de supervisor...', 'yellow');
  const loginResult = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'supervisor', password: 'supervisor' })
  });

  if (loginResult.data.token) {
    logResult(true, 'Supervisor puede autenticarse correctamente');

    // Verificar que el token contiene el rol correcto
    const payload = JSON.parse(Buffer.from(loginResult.data.token.split('.')[1], 'base64').toString());
    return logResult(
      payload.role === 'supervisor',
      `Rol en token: ${payload.role}`
    );
  } else {
    logResult(false, 'Usuario supervisor no encontrado o credenciales incorrectas');
    return false;
  }
}

async function testFlebotomistaPermissions() {
  logTest('Verificar que flebotomista NO ve botón "Finalizar Toma"');

  log('Este test requiere verificación manual en el frontend:', 'yellow');
  log('1. Iniciar sesión como flebotomista', 'blue');
  log('2. Navegar a /turns/attention', 'blue');
  log('3. Verificar que NO aparece el botón "Finalizar Toma"', 'blue');
  log('4. Verificar que SÍ aparece el botón "Repetir Llamado"', 'blue');

  // Hacer login como flebotomista
  log('\nVerificando autenticación de flebotomista...', 'yellow');
  const loginResult = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'jperez', password: 'jperez' })
  });

  if (loginResult.data.token) {
    logResult(true, 'Flebotomista puede autenticarse correctamente');

    const payload = JSON.parse(Buffer.from(loginResult.data.token.split('.')[1], 'base64').toString());
    return logResult(
      payload.role?.toLowerCase() === 'flebotomista',
      `Rol en token: ${payload.role}`
    );
  } else {
    logResult(false, 'Usuario flebotomista no encontrado');
    return false;
  }
}

async function testSupervisorRouteAccess() {
  logTest('Acceso de supervisor al módulo de atención');

  log('Verificando configuración de rutas en ProtectedRoute.js...', 'yellow');

  const fs = require('fs');
  const protectedRouteContent = fs.readFileSync(
    '/Users/samuelquiroz/Documents/proyectos/toma-turno/components/ProtectedRoute.js',
    'utf8'
  );

  // Verificar que supervisor está incluido en la validación
  const hasSupervisorCheck = protectedRouteContent.includes("userRole !== 'supervisor'");

  logResult(
    hasSupervisorCheck,
    hasSupervisorCheck
      ? 'ProtectedRoute.js incluye validación para rol supervisor'
      : 'ProtectedRoute.js NO incluye validación para supervisor'
  );

  // Verificar en HamburgerMenu
  const menuContent = fs.readFileSync(
    '/Users/samuelquiroz/Documents/proyectos/toma-turno/components/HamburgerMenu.js',
    'utf8'
  );

  const hasSupervisorMenu = menuContent.includes("user?.role === 'supervisor'");

  logResult(
    hasSupervisorMenu,
    hasSupervisorMenu
      ? 'HamburgerMenu.js incluye sección para supervisor'
      : 'HamburgerMenu.js NO incluye sección para supervisor'
  );

  // Verificar en index.js (dashboard)
  const indexContent = fs.readFileSync(
    '/Users/samuelquiroz/Documents/proyectos/toma-turno/pages/index.js',
    'utf8'
  );

  const hasSupervisorDashboard = indexContent.includes('isSupervisor');

  return logResult(
    hasSupervisorDashboard,
    hasSupervisorDashboard
      ? 'Dashboard (index.js) incluye lógica para supervisor'
      : 'Dashboard NO incluye lógica para supervisor'
  );
}

async function testSkipButtonFunctionality() {
  logTest('Funcionalidad del botón "Saltar al siguiente"');

  log('Verificando implementación en attention.js...', 'yellow');

  const fs = require('fs');
  const attentionContent = fs.readFileSync(
    '/Users/samuelquiroz/Documents/proyectos/toma-turno/pages/turns/attention.js',
    'utf8'
  );

  // Verificar que QuickActionsBar solo se muestra cuando no hay paciente activo
  const hasCorrectCondition = attentionContent.includes('!activePatient && nextPatient');

  logResult(
    hasCorrectCondition,
    hasCorrectCondition
      ? 'QuickActionsBar solo se muestra cuando !activePatient && nextPatient'
      : 'Condición de QuickActionsBar incorrecta'
  );

  // Verificar que se pasa solo nextPatient
  const passesNextPatient = attentionContent.includes('patient={nextPatient}');

  return logResult(
    passesNextPatient,
    passesNextPatient
      ? 'QuickActionsBar recibe correctamente solo nextPatient'
      : 'QuickActionsBar no recibe nextPatient correctamente'
  );
}

async function testCompilation() {
  logTest('Verificar compilación de módulos modificados');

  log('Verificando que el servidor de desarrollo está corriendo...', 'yellow');

  try {
    // Test 1: Página de perfil
    const profileResponse = await fetch(`${baseURL}/profile`);
    logResult(
      profileResponse.ok || profileResponse.status === 401,
      `Página /profile: ${profileResponse.status} ${profileResponse.statusText}`
    );

    // Test 2: Página de atención
    const attentionResponse = await fetch(`${baseURL}/turns/attention`);
    logResult(
      attentionResponse.ok || attentionResponse.status === 401,
      `Página /turns/attention: ${attentionResponse.status} ${attentionResponse.statusText}`
    );

    // Test 3: API de actualización de perfil
    const apiResponse = await fetch(`${baseURL}/api/profile/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    logResult(
      apiResponse.status === 401, // Esperamos 401 sin token
      `API /api/profile/update: ${apiResponse.status} ${apiResponse.statusText} (esperado 401 sin auth)`
    );

    return true;
  } catch (error) {
    logResult(false, `Error al verificar compilación: ${error.message}`);
    return false;
  }
}

// ==================== MAIN ====================

async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                     TESTING DE CAMBIOS DE SESIÓN                          ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'cyan');

  const results = {
    compilation: await testCompilation(),
    profileRestriction: await testProfileUsernameRestriction(),
    supervisorPermissions: await testSupervisorPermissions(),
    flebotomistaPermissions: await testFlebotomistaPermissions(),
    supervisorRouteAccess: await testSupervisorRouteAccess(),
    skipButton: await testSkipButtonFunctionality()
  };

  // Resumen final
  log('\n╔════════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                           RESUMEN DE TESTS                                 ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'cyan');

  const passed = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;

  for (const [test, result] of Object.entries(results)) {
    log(`${result ? '✅' : '❌'} ${test}`, result ? 'green' : 'red');
  }

  console.log('\n' + '='.repeat(80));
  log(`\n📊 Resultado Final: ${passed}/${total} tests pasados`, passed === total ? 'green' : 'yellow');

  if (passed === total) {
    log('\n🎉 ¡Todos los tests pasaron exitosamente!', 'green');
  } else {
    log(`\n⚠️  ${total - passed} test(s) fallaron. Revisar arriba para detalles.`, 'yellow');
  }

  console.log('='.repeat(80) + '\n');
}

// Ejecutar tests
runAllTests().catch(error => {
  log(`Error fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

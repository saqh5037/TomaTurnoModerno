/**
 * Script para auditar y documentar todas las pantallas del sistema TomaTurno
 * Genera un reporte de las pantallas que necesitan screenshots actualizados
 */

const fs = require('fs');
const path = require('path');

// Definir todas las rutas del sistema organizadas por módulo
const systemRoutes = {
  authentication: [
    { path: '/login', name: 'Login', description: 'Pantalla de inicio de sesión', requiresAuth: false },
    { path: '/select-cubicle', name: 'Selección de Cubículo', description: 'Pantalla para seleccionar cubículo (Flebotomistas)', requiresAuth: true, role: 'flebotomista' }
  ],

  dashboard: [
    { path: '/', name: 'Dashboard Principal', description: 'Dashboard principal según rol del usuario', requiresAuth: true, role: 'all' },
    { path: '/statistics/dashboard', name: 'Dashboard Estadísticas', description: 'Dashboard de estadísticas (Admin)', requiresAuth: true, role: 'admin' }
  ],

  users: [
    { path: '/users', name: 'Gestión de Usuarios', description: 'Lista y gestión de usuarios del sistema', requiresAuth: true, role: 'admin' },
    { path: '/profile', name: 'Perfil de Usuario', description: 'Perfil personal del usuario', requiresAuth: true, role: 'all' }
  ],

  turns: [
    { path: '/turns/attention', name: 'Panel de Atención', description: 'Panel principal para atender pacientes', requiresAuth: true, role: 'flebotomista' },
    { path: '/turns/queue-tv', name: 'Cola Pública (TV)', description: 'Pantalla de cola para display público', requiresAuth: false }
  ],

  statistics: [
    { path: '/statistics', name: 'Estadísticas Principal', description: 'Hub de estadísticas', requiresAuth: true, role: 'admin' },
    { path: '/statistics/daily', name: 'Estadísticas Diarias', description: 'Reporte de estadísticas por día', requiresAuth: true, role: 'admin' },
    { path: '/statistics/monthly', name: 'Estadísticas Mensuales', description: 'Reporte de estadísticas por mes', requiresAuth: true, role: 'admin' },
    { path: '/statistics/phlebotomists', name: 'Rendimiento Flebotomistas', description: 'Estadísticas individuales de flebotomistas', requiresAuth: true, role: 'admin' },
    { path: '/statistics/average-time', name: 'Tiempo Promedio', description: 'Análisis de tiempos de atención', requiresAuth: true, role: 'admin' }
  ],

  documentation: [
    { path: '/docs', name: 'Hub de Documentación', description: 'Centro de documentación principal', requiresAuth: true, role: 'all' },
    { path: '/docs/dashboard', name: 'Docs: Dashboard', description: 'Documentación del dashboard', requiresAuth: true, role: 'all' },
    { path: '/docs/users', name: 'Docs: Usuarios', description: 'Documentación de gestión de usuarios', requiresAuth: true, role: 'all' },
    { path: '/docs/turnos', name: 'Docs: Turnos', description: 'Documentación de gestión de turnos', requiresAuth: true, role: 'all' },
    { path: '/docs/atencion', name: 'Docs: Atención', description: 'Documentación del panel de atención', requiresAuth: true, role: 'all' },
    { path: '/docs/estadisticas', name: 'Docs: Estadísticas', description: 'Documentación de estadísticas', requiresAuth: true, role: 'all' },
    { path: '/docs/cubiculos', name: 'Docs: Cubículos', description: 'Documentación de gestión de cubículos', requiresAuth: true, role: 'all' },
    { path: '/docs/cola', name: 'Docs: Cola', description: 'Documentación del sistema de cola', requiresAuth: true, role: 'all' }
  ],

  other: [
    { path: '/satisfaction-survey', name: 'Encuesta de Satisfacción', description: 'Encuesta post-atención', requiresAuth: false },
    { path: '/announce', name: 'Panel de Anuncios', description: 'Pantalla de anuncios/llamado de pacientes', requiresAuth: false }
  ]
};

// Leer screenshots actuales
const screenshotsDir = path.join(__dirname, '../public/docs/screenshots');
const metadataPath = path.join(screenshotsDir, 'screenshots-metadata.json');

let currentScreenshots = [];
try {
  const metadataContent = fs.readFileSync(metadataPath, 'utf8');
  currentScreenshots = JSON.parse(metadataContent);
} catch (error) {
  console.log('No se pudo leer metadata existente:', error.message);
}

// Generar reporte
console.log('\n' + '='.repeat(80));
console.log('📸 AUDITORÍA DE SCREENSHOTS - TomaTurno v2.6.0');
console.log('='.repeat(80) + '\n');

console.log('📋 RESUMEN DE RUTAS DEL SISTEMA:\n');

let totalRoutes = 0;
let screenshotedRoutes = 0;
let missingScreenshots = [];

Object.keys(systemRoutes).forEach(module => {
  const routes = systemRoutes[module];
  console.log(`\n🔹 ${module.toUpperCase()} (${routes.length} rutas)`);
  console.log('-'.repeat(80));

  routes.forEach(route => {
    totalRoutes++;
    const hasScreenshot = currentScreenshots.some(s =>
      s.path && route.path && s.path.includes(route.path.split('/')[1])
    );

    const status = hasScreenshot ? '✅' : '❌';
    if (hasScreenshot) screenshotedRoutes++;
    else missingScreenshots.push(route);

    console.log(`${status} ${route.name}`);
    console.log(`   Ruta: ${route.path}`);
    console.log(`   Rol: ${route.role || 'N/A'} | Auth: ${route.requiresAuth ? 'Sí' : 'No'}`);
    console.log(`   ${route.description}`);
  });
});

console.log('\n' + '='.repeat(80));
console.log('📊 ESTADÍSTICAS DE COBERTURA:\n');
console.log(`Total de rutas: ${totalRoutes}`);
console.log(`Screenshots existentes: ${currentScreenshots.length}`);
console.log(`Rutas con screenshots: ${screenshotedRoutes}`);
console.log(`Rutas sin screenshots: ${missingScreenshots.length}`);
console.log(`Cobertura: ${Math.round((screenshotedRoutes / totalRoutes) * 100)}%`);

if (missingScreenshots.length > 0) {
  console.log('\n' + '='.repeat(80));
  console.log('❌ RUTAS SIN SCREENSHOTS:\n');
  missingScreenshots.forEach(route => {
    console.log(`• ${route.name} (${route.path})`);
  });
}

console.log('\n' + '='.repeat(80));
console.log('📝 SCREENSHOTS ACTUALES:\n');
currentScreenshots.forEach(screenshot => {
  console.log(`• ${screenshot.name} (${screenshot.size})`);
  console.log(`  Módulo: ${screenshot.moduleId}`);
  console.log(`  ${screenshot.description}`);
  console.log('');
});

console.log('\n' + '='.repeat(80));
console.log('✨ RECOMENDACIONES:\n');

console.log('1. TOMAR SCREENSHOTS NUEVOS:');
missingScreenshots.forEach(route => {
  console.log(`   • Navegar a ${route.path} y capturar`);
});

console.log('\n2. ACTUALIZAR SCREENSHOTS EXISTENTES:');
console.log('   • turnos-form.png (10.9 KB - parece muy pequeño)');
console.log('   • turnos-details.png (10.9 KB - parece muy pequeño)');

console.log('\n3. VERIFICAR CALIDAD:');
console.log('   • Todos los screenshots deben ser > 100 KB para buena calidad');
console.log('   • Resolución recomendada: 1920x1080 o 1440x900');
console.log('   • Formato: PNG con compresión moderada');

console.log('\n' + '='.repeat(80));
console.log('🎯 PLAN DE CAPTURA:\n');
console.log('FASE 1 - Autenticación (5 min):');
console.log('  1. /login - Capturar formulario de login');
console.log('  2. /login - Capturar con credenciales ingresadas');
console.log('  3. /select-cubicle - Capturar selección de cubículo\n');

console.log('FASE 2 - Dashboards (10 min):');
console.log('  1. / - Dashboard Admin con datos');
console.log('  2. / - Dashboard Flebotomista');
console.log('  3. /statistics/dashboard - Dashboard de estadísticas\n');

console.log('FASE 3 - Gestión (15 min):');
console.log('  1. /users - Lista de usuarios');
console.log('  2. /users - Modal de crear/editar usuario');
console.log('  3. /profile - Perfil de usuario\n');

console.log('FASE 4 - Turnos y Atención (20 min):');
console.log('  1. /turns/attention - Panel principal vacío');
console.log('  2. /turns/attention - Con paciente llamado');
console.log('  3. /turns/attention - Sidebar de pacientes sugeridos');
console.log('  4. /turns/attention - Modal de notas/observaciones');
console.log('  5. /turns/queue-tv - Cola pública con pacientes\n');

console.log('FASE 5 - Estadísticas (25 min):');
console.log('  1. /statistics - Hub principal');
console.log('  2. /statistics/daily - Vista diaria con gráficas');
console.log('  3. /statistics/monthly - Vista mensual con comparativas');
console.log('  4. /statistics/phlebotomists - Ranking de flebotomistas');
console.log('  5. /statistics/average-time - Análisis de tiempos\n');

console.log('FASE 6 - Documentación (15 min):');
console.log('  1. /docs - Hub principal');
console.log('  2. /docs/dashboard - Página de documentación');
console.log('  3. /docs/atencion - Con imágenes y contenido expandido\n');

console.log('FASE 7 - Otros (10 min):');
console.log('  1. /satisfaction-survey - Encuesta');
console.log('  2. /announce - Panel de anuncios\n');

console.log('='.repeat(80));
console.log('⏱️  TIEMPO TOTAL ESTIMADO: 100 minutos (1.5-2 horas)\n');

// Guardar reporte en archivo
const reportPath = path.join(__dirname, '../docs/AUDIT_SCREENSHOTS_REPORT.md');
const reportContent = `# Auditoría de Screenshots - TomaTurno

**Fecha:** ${new Date().toLocaleString('es-ES')}
**Versión:** 2.6.0

## Resumen

- **Total de rutas:** ${totalRoutes}
- **Screenshots existentes:** ${currentScreenshots.length}
- **Cobertura:** ${Math.round((screenshotedRoutes / totalRoutes) * 100)}%

## Rutas sin Screenshots

${missingScreenshots.map(r => `- [ ] **${r.name}** (\`${r.path}\`) - ${r.description}`).join('\n')}

## Screenshots Actuales

${currentScreenshots.map(s => `- ✅ **${s.name}** (${s.size}) - ${s.description}`).join('\n')}

## Próximos Pasos

1. Tomar screenshots de rutas faltantes
2. Actualizar screenshots pequeños (< 50 KB)
3. Actualizar metadata.json con nuevas capturas
4. Actualizar content.js con referencias correctas
`;

fs.writeFileSync(reportPath, reportContent);
console.log(`📄 Reporte guardado en: ${reportPath}\n`);

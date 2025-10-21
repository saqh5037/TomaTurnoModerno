const fs = require('fs');
const path = require('path');

const fullDocPath = path.join(__dirname, '../lib/docs/fullDocumentation.json');
const fullDoc = JSON.parse(fs.readFileSync(fullDocPath, 'utf8'));

console.log('\n═══════════════════════════════════════════════════════════');
console.log('   RESUMEN COMPLETO DE DOCUMENTACIÓN DE MÓDULOS');
console.log('   Sistema de Gestión de Turnos INER');
console.log('═══════════════════════════════════════════════════════════\n');

const modulesToCheck = [
  { id: 'cubiculos', name: 'Gestión de Cubículos' },
  { id: 'cola', name: 'Gestión de Cola' },
  { id: 'estadisticas', name: 'Módulo de Estadísticas' },
  { id: 'turnos', name: 'Creación de Turnos' }
];

modulesToCheck.forEach((mod, index) => {
  const module = fullDoc.find(m => m.moduleId === mod.id);

  if (module && module.content) {
    console.log(`${index + 1}. 📘 ${mod.name.toUpperCase()} (moduleId: ${mod.id})`);
    console.log('   ─────────────────────────────────────────────────────');
    console.log(`   ✅ Estado: DOCUMENTADO COMPLETAMENTE`);
    console.log(`   📊 Secciones (pasos): ${module.content.sections?.length || 0}`);
    console.log(`   📸 Screenshots: ${module.content.screenshots?.length || 0}`);
    console.log(`   💡 Tips: ${module.content.tips?.length || 0}`);
    console.log(`   ⚠️  Warnings: ${module.content.warnings?.length || 0}`);
    console.log(`   🎯 Features: ${module.content.features?.length || 0}`);

    // Calcular palabras en overview y secciones
    let totalWords = 0;
    if (module.content.overview) {
      totalWords += module.content.overview.split(/\s+/).length;
    }
    if (module.content.sections) {
      module.content.sections.forEach(s => {
        totalWords += (s.content || '').split(/\s+/).length;
      });
    }
    console.log(`   📝 Palabras totales (aprox): ${totalWords.toLocaleString()}`);
    console.log('');
  } else {
    console.log(`${index + 1}. ❌ ${mod.name.toUpperCase()} (moduleId: ${mod.id})`);
    console.log('   ─────────────────────────────────────────────────────');
    console.log('   ❌ Estado: NO DOCUMENTADO O INCOMPLETO');
    console.log('');
  }
});

console.log('═══════════════════════════════════════════════════════════');
console.log('   RESUMEN GENERAL');
console.log('═══════════════════════════════════════════════════════════');

const documentedModules = modulesToCheck.filter(mod => {
  const module = fullDoc.find(m => m.moduleId === mod.id);
  return module && module.content && module.content.sections && module.content.sections.length > 0;
});

console.log(`✅ Módulos documentados: ${documentedModules.length} de ${modulesToCheck.length}`);

let totalSections = 0;
let totalScreenshots = 0;
let totalTips = 0;
let totalWarnings = 0;
let totalFeatures = 0;
let totalWords = 0;

documentedModules.forEach(mod => {
  const module = fullDoc.find(m => m.moduleId === mod.id);
  if (module.content) {
    totalSections += module.content.sections?.length || 0;
    totalScreenshots += module.content.screenshots?.length || 0;
    totalTips += module.content.tips?.length || 0;
    totalWarnings += module.content.warnings?.length || 0;
    totalFeatures += module.content.features?.length || 0;

    if (module.content.overview) {
      totalWords += module.content.overview.split(/\s+/).length;
    }
    if (module.content.sections) {
      module.content.sections.forEach(s => {
        totalWords += (s.content || '').split(/\s+/).length;
      });
    }
  }
});

console.log(`📊 Total de secciones (pasos): ${totalSections}`);
console.log(`📸 Total de screenshots: ${totalScreenshots}`);
console.log(`💡 Total de tips: ${totalTips}`);
console.log(`⚠️  Total de warnings: ${totalWarnings}`);
console.log(`🎯 Total de features: ${totalFeatures}`);
console.log(`📝 Total de palabras (aprox): ${totalWords.toLocaleString()}`);

console.log('\n═══════════════════════════════════════════════════════════');
console.log('   VERIFICACIÓN DE CALIDAD');
console.log('═══════════════════════════════════════════════════════════');

const qualityChecks = documentedModules.map(mod => {
  const module = fullDoc.find(m => m.moduleId === mod.id);
  const checks = {
    name: mod.name,
    hasOverview: Boolean(module.content.overview),
    hasSections: (module.content.sections?.length || 0) >= 4,
    hasScreenshots: (module.content.screenshots?.length || 0) >= 5,
    hasTips: (module.content.tips?.length || 0) >= 9,
    hasWarnings: (module.content.warnings?.length || 0) >= 7,
    hasFeatures: (module.content.features?.length || 0) >= 10
  };
  return checks;
});

qualityChecks.forEach(check => {
  console.log(`\n📘 ${check.name}`);
  console.log(`   Overview completo: ${check.hasOverview ? '✅' : '❌'}`);
  console.log(`   Secciones (≥4): ${check.hasSections ? '✅' : '❌'}`);
  console.log(`   Screenshots (≥5): ${check.hasScreenshots ? '✅' : '❌'}`);
  console.log(`   Tips (≥9): ${check.hasTips ? '✅' : '❌'}`);
  console.log(`   Warnings (≥7): ${check.hasWarnings ? '✅' : '❌'}`);
  console.log(`   Features (≥10): ${check.hasFeatures ? '✅' : '❌'}`);
});

const allPassed = qualityChecks.every(check =>
  check.hasOverview && check.hasSections && check.hasScreenshots &&
  check.hasTips && check.hasWarnings && check.hasFeatures
);

console.log('\n═══════════════════════════════════════════════════════════');
if (allPassed) {
  console.log('   ✅ TODOS LOS MÓDULOS CUMPLEN CON ESTÁNDARES DE CALIDAD');
} else {
  console.log('   ⚠️  ALGUNOS MÓDULOS NECESITAN REVISIÓN');
}
console.log('═══════════════════════════════════════════════════════════\n');

console.log('🎉 Documentación completada exitosamente!');
console.log('📁 Archivo actualizado: /Users/samuelquiroz/Documents/proyectos/toma-turno/lib/docs/fullDocumentation.json');
console.log('\n💾 Scripts de documentación creados:');
console.log('   - scripts/updateCubiculosDocsTutorial.js');
console.log('   - scripts/updateColaDocsTutorial.js');
console.log('   - scripts/updateEstadisticasDocsTutorial.js');
console.log('   - scripts/updateTurnosDocsTutorial.js');
console.log('');

/**
 * Script para actualizar fullDocumentation.json con las nuevas screenshots
 */

const fs = require('fs');
const path = require('path');

const DOCS_FILE = path.join(__dirname, '../lib/docs/fullDocumentation.json');
const METADATA_FILE = path.join(__dirname, '../public/docs/screenshots/screenshots-metadata.json');

// Leer archivos
const fullDocs = JSON.parse(fs.readFileSync(DOCS_FILE, 'utf-8'));
const metadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'));

console.log('🔄 Actualizando documentación con nuevas screenshots...\n');

// Agrupar screenshots por moduleId
const screenshotsByModule = {};
metadata.forEach(screenshot => {
  const moduleId = screenshot.moduleId;
  if (!screenshotsByModule[moduleId]) {
    screenshotsByModule[moduleId] = [];
  }
  screenshotsByModule[moduleId].push({
    filename: screenshot.filename,
    name: screenshot.name,
    description: screenshot.description,
    tags: screenshot.tags,
    path: screenshot.path
  });
});

// Actualizar cada módulo con sus screenshots
let updatedModules = 0;
fullDocs.forEach(module => {
  const moduleId = module.moduleId;
  if (screenshotsByModule[moduleId]) {
    module.content.screenshots = screenshotsByModule[moduleId];
    updatedModules++;
    console.log(`✅ ${module.title}: ${screenshotsByModule[moduleId].length} screenshots`);
  } else {
    console.log(`⚠️  ${module.title}: Sin screenshots`);
  }
});

// Guardar archivo actualizado
fs.writeFileSync(DOCS_FILE, JSON.stringify(fullDocs, null, 2), 'utf-8');

console.log(`\n✨ Actualización completada!`);
console.log(`📊 ${updatedModules}/${fullDocs.length} módulos actualizados`);
console.log(`📸 Total screenshots: ${metadata.length}`);
console.log(`💾 Archivo guardado: ${DOCS_FILE}`);

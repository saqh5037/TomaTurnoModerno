const fs = require('fs');
const path = require('path');

// Leer el archivo JSON
const jsonPath = path.join(__dirname, '..', 'lib', 'docs', 'fullDocumentation.json');
const fullDocumentation = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Agregar campo 'id' a cada módulo si no existe (debe ser igual a moduleId)
fullDocumentation.forEach(module => {
  if (!module.id || module.id === null) {
    module.id = module.moduleId;
    console.log(`✅ Agregado id="${module.moduleId}" al módulo: ${module.title}`);
  } else {
    console.log(`⏭️  Módulo ${module.title} ya tiene id="${module.id}"`);
  }
});

// Guardar el archivo actualizado
fs.writeFileSync(jsonPath, JSON.stringify(fullDocumentation, null, 2), 'utf8');

console.log('\n🎉 Todos los módulos ahora tienen el campo "id" correctamente configurado');
console.log('📁 Archivo actualizado:', jsonPath);

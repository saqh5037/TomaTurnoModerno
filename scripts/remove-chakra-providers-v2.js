const fs = require('fs');
const path = require('path');

// Archivos a procesar
const filesToFix = [
  'pages/turns/queue.js',
  'pages/turns/queue-tv.js',
  'pages/turns/queue_video.js',
  'pages/turns/manual.js',
  'pages/users/index.js',
  'pages/cubicles/index.js',
  'pages/profile.js',
  'pages/satisfaction-survey.js',
  'pages/statistics/index.js',
  'pages/statistics/monthly.js',
  'pages/statistics/daily.js',
  'pages/statistics/average-time.js',
  'pages/statistics/phlebotomists.js',
  'pages/docs/index.js',
  'pages/docs/tutorials.js',
  'pages/docs/learn.js',
  'pages/docs/queue.js',
  'pages/docs/reports.js',
  'pages/docs/statistics.js',
  'pages/docs/[moduleId].js',
];

const baseDir = '/Users/samuelquiroz/Documents/proyectos/toma-turno';

filesToFix.forEach(file => {
  const filePath = path.join(baseDir, file);

  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Archivo no encontrado: ${file}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 1. Remover todas las variantes de <ChakraProvider>
    content = content.replace(/<ChakraProvider[^>]*>\s*/g, '');

    // 2. Remover todas las etiquetas de cierre </ChakraProvider>
    content = content.replace(/\s*<\/ChakraProvider>/g, '');

    // 3. Remover ChakraProvider de imports
    content = content.replace(/,\s*ChakraProvider/g, '');
    content = content.replace(/ChakraProvider,\s*/g, '');

    // 4. Remover modernTheme y theme de imports
    content = content.replace(/import\s*{\s*modernTheme,\s*/g, 'import { ');
    content = content.replace(/,\s*modernTheme\s*}/g, ' }');
    content = content.replace(/{\s*modernTheme\s*}/g, '{}');
    content = content.replace(/import\s+theme\s+from\s+['"][^'"]+['"]\s*;?\s*/g, '');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corregido: ${file}`);
    } else {
      console.log(`ℹ️  Sin cambios: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error procesando ${file}:`, error.message);
  }
});

console.log('\n✅ Proceso completado');

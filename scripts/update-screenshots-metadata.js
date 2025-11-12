/**
 * Script para actualizar automáticamente el metadata de screenshots
 * Lee todos los PNG en la carpeta de screenshots y genera/actualiza el metadata.json
 */

const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, '../public/docs/screenshots');
const metadataPath = path.join(screenshotsDir, 'screenshots-metadata.json');

// Mapeo de nombres de archivo a configuración de metadata
const screenshotConfig = {
  // Authentication
  'login-empty': {
    moduleId: 'login',
    description: 'Pantalla de inicio de sesión sin credenciales',
    tags: ['autenticación', 'login', 'seguridad']
  },
  'login-filled': {
    moduleId: 'login',
    description: 'Formulario de login con credenciales ingresadas',
    tags: ['autenticación', 'login', 'formulario']
  },
  'select-cubicle': {
    moduleId: 'cubicles',
    description: 'Pantalla de selección de cubículo para flebotomistas',
    tags: ['cubículos', 'selección', 'flebotomista']
  },

  // Dashboards
  'dashboard-admin-main': {
    moduleId: 'dashboard',
    description: 'Dashboard principal del administrador con métricas en tiempo real',
    tags: ['admin', 'dashboard', 'métricas']
  },
  'dashboard-phlebotomist-main': {
    moduleId: 'dashboard',
    description: 'Dashboard principal del flebotomista con acciones rápidas',
    tags: ['flebotomista', 'dashboard', 'panel']
  },
  'dashboard-main': {
    moduleId: 'dashboard',
    description: 'Vista principal del dashboard administrativo con métricas en tiempo real',
    tags: ['admin', 'dashboard', 'estadísticas']
  },
  'dashboard-metrics': {
    moduleId: 'dashboard',
    description: 'Métricas detalladas del dashboard incluyendo cola, tiempos y flebotomistas',
    tags: ['admin', 'dashboard', 'métricas']
  },
  'statistics-dashboard-main': {
    moduleId: 'estadisticas',
    description: 'Dashboard completo de estadísticas con gráficas y análisis',
    tags: ['estadísticas', 'dashboard', 'análisis']
  },

  // Users
  'users-list': {
    moduleId: 'users',
    description: 'Lista completa de usuarios del sistema con roles y estados',
    tags: ['admin', 'usuarios', 'gestión']
  },
  'users-details': {
    moduleId: 'users',
    description: 'Vista detallada de usuarios mostrando información de roles y permisos',
    tags: ['admin', 'usuarios', 'detalles']
  },
  'users-list-empty': {
    moduleId: 'users',
    description: 'Lista de usuarios en estado vacío',
    tags: ['admin', 'usuarios', 'vacío']
  },
  'users-modal-create': {
    moduleId: 'users',
    description: 'Modal de creación de nuevo usuario',
    tags: ['admin', 'usuarios', 'crear']
  },
  'profile-view': {
    moduleId: 'users',
    description: 'Vista del perfil personal del usuario',
    tags: ['perfil', 'usuario', 'configuración']
  },
  'profile-edit-mode': {
    moduleId: 'users',
    description: 'Modo de edición del perfil de usuario',
    tags: ['perfil', 'edición', 'usuario']
  },

  // Atención / Turns
  'atencion-main': {
    moduleId: 'atencion',
    description: 'Interfaz principal de atención de pacientes para flebotomistas',
    tags: ['atención', 'pacientes', 'flebotomista']
  },
  'atencion-sidebar': {
    moduleId: 'atencion',
    description: 'Sidebar de atención mostrando pacientes sugeridos y cola',
    tags: ['atención', 'sidebar', 'pacientes']
  },
  'atencion-actions': {
    moduleId: 'atencion',
    description: 'Botones de acción para llamar, atender y gestionar pacientes',
    tags: ['atención', 'acciones', 'botones']
  },
  'attention-panel-empty': {
    moduleId: 'atencion',
    description: 'Panel de atención sin paciente seleccionado, estado inicial',
    tags: ['atención', 'panel', 'vacío']
  },
  'attention-panel-active': {
    moduleId: 'atencion',
    description: 'Panel de atención con paciente activo en proceso de atención',
    tags: ['atención', 'paciente', 'activo']
  },
  'attention-sidebar-patients': {
    moduleId: 'atencion',
    description: 'Detalle del sidebar mostrando pacientes sugeridos con prioridades',
    tags: ['atención', 'sidebar', 'sugeridos']
  },
  'attention-modal-notes': {
    moduleId: 'atencion',
    description: 'Modal para agregar notas y observaciones al paciente',
    tags: ['atención', 'modal', 'notas']
  },

  // Cola / Queue
  'cola-main': {
    moduleId: 'cola',
    description: 'Cola pública mostrando pacientes en espera ordenados por prioridad',
    tags: ['turnos', 'cola', 'pacientes']
  },
  'cola-priority': {
    moduleId: 'cola',
    description: 'Vista de cola mostrando iconos de prioridad y estados de pacientes',
    tags: ['cola', 'prioridad', 'iconos']
  },
  'queue-tv-display': {
    moduleId: 'cola',
    description: 'Pantalla de cola optimizada para display público (TV/monitor)',
    tags: ['cola', 'público', 'display']
  },

  // Estadísticas
  'estadisticas-dashboard': {
    moduleId: 'estadisticas',
    description: 'Dashboard principal de estadísticas con métricas generales',
    tags: ['estadísticas', 'dashboard', 'métricas']
  },
  'estadisticas-daily': {
    moduleId: 'estadisticas',
    description: 'Estadísticas diarias con gráficas de pacientes atendidos por día',
    tags: ['estadísticas', 'diarias', 'gráficas']
  },
  'estadisticas-monthly': {
    moduleId: 'estadisticas',
    description: 'Estadísticas mensuales mostrando tendencias y comparativas',
    tags: ['estadísticas', 'mensuales', 'tendencias']
  },
  'estadisticas-phlebotomists': {
    moduleId: 'estadisticas',
    description: 'Rendimiento individual de flebotomistas con métricas de productividad',
    tags: ['estadísticas', 'flebotomistas', 'rendimiento']
  },
  'estadisticas-time': {
    moduleId: 'estadisticas',
    description: 'Análisis de tiempo promedio de atención por paciente',
    tags: ['estadísticas', 'tiempo', 'promedio']
  },
  'statistics-hub': {
    moduleId: 'estadisticas',
    description: 'Hub principal de estadísticas con acceso a todos los reportes',
    tags: ['estadísticas', 'hub', 'reportes']
  },
  'statistics-daily-report': {
    moduleId: 'estadisticas',
    description: 'Reporte detallado de estadísticas diarias con gráficas interactivas',
    tags: ['estadísticas', 'reporte', 'diario']
  },
  'statistics-monthly-report': {
    moduleId: 'estadisticas',
    description: 'Reporte mensual con análisis de tendencias y comparativas',
    tags: ['estadísticas', 'reporte', 'mensual']
  },
  'statistics-phlebotomists-ranking': {
    moduleId: 'estadisticas',
    description: 'Ranking y métricas detalladas de rendimiento por flebotomista',
    tags: ['estadísticas', 'ranking', 'flebotomistas']
  },
  'statistics-average-time': {
    moduleId: 'estadisticas',
    description: 'Análisis detallado de tiempos promedio de atención',
    tags: ['estadísticas', 'tiempo', 'análisis']
  },

  // Cubículos
  'cubiculos-list': {
    moduleId: 'cubiculos',
    description: 'Gestión de cubículos mostrando cubículos generales y especiales',
    tags: ['admin', 'cubículos', 'gestión']
  },
  'cubiculos-types': {
    moduleId: 'cubiculos',
    description: 'Vista de tipos de cubículos con indicadores visuales',
    tags: ['cubículos', 'tipos', 'visual']
  },

  // Turnos
  'turnos-form': {
    moduleId: 'turnos',
    description: 'Formulario para crear nuevos turnos de pacientes',
    tags: ['turnos', 'crear', 'formulario']
  },
  'turnos-details': {
    moduleId: 'turnos',
    description: 'Vista detallada del formulario mostrando todos los campos requeridos',
    tags: ['turnos', 'formulario', 'detalles']
  },
  'turnos-form-new': {
    moduleId: 'turnos',
    description: 'Formulario completo actualizado para creación de turnos',
    tags: ['turnos', 'formulario', 'crear']
  },
  'turnos-details-new': {
    moduleId: 'turnos',
    description: 'Vista detallada actualizada con información completa del turno',
    tags: ['turnos', 'detalles', 'información']
  },

  // Otros
  'satisfaction-survey': {
    moduleId: 'survey',
    description: 'Encuesta de satisfacción post-atención para pacientes',
    tags: ['encuesta', 'satisfacción', 'pacientes']
  },
  'announce-panel': {
    moduleId: 'announce',
    description: 'Panel de anuncios y llamado de pacientes para display público',
    tags: ['anuncios', 'llamado', 'público']
  }
};

// Función para obtener el tamaño del archivo en formato legible
function getFileSizeString(filePath) {
  const stats = fs.statSync(filePath);
  const sizeInBytes = stats.size;
  const sizeInKB = sizeInBytes / 1024;

  if (sizeInKB < 1024) {
    return `${sizeInKB.toFixed(1)} KB`;
  } else {
    const sizeInMB = sizeInKB / 1024;
    return `${sizeInMB.toFixed(1)} MB`;
  }
}

// Función para generar metadata automáticamente
function generateMetadata() {
  const metadata = [];

  // Leer todos los archivos PNG en el directorio
  const files = fs.readdirSync(screenshotsDir)
    .filter(file => file.endsWith('.png') && file !== 'screenshots-metadata.json');

  console.log(`\n📸 Procesando ${files.length} screenshots...\n`);

  files.forEach(filename => {
    const filePath = path.join(screenshotsDir, filename);
    const name = filename.replace('.png', '');

    // Buscar configuración predefinida
    let config = screenshotConfig[name];

    // Si no hay configuración, generar una básica
    if (!config) {
      console.warn(`⚠️  No hay configuración para: ${name} - Generando básica...`);
      config = {
        moduleId: 'general',
        description: `Screenshot: ${name}`,
        tags: ['general']
      };
    }

    const size = getFileSizeString(filePath);

    metadata.push({
      moduleId: config.moduleId,
      filename: filename,
      name: name,
      description: config.description,
      tags: config.tags,
      path: `/docs/screenshots/${filename}`,
      size: size
    });

    console.log(`✅ ${filename} (${size}) - ${config.moduleId}`);
  });

  return metadata;
}

// Función principal
function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🔄 ACTUALIZANDO METADATA DE SCREENSHOTS');
  console.log('='.repeat(80));

  try {
    // Generar metadata
    const metadata = generateMetadata();

    // Ordenar por moduleId y luego por nombre
    metadata.sort((a, b) => {
      if (a.moduleId === b.moduleId) {
        return a.name.localeCompare(b.name);
      }
      return a.moduleId.localeCompare(b.moduleId);
    });

    // Guardar metadata
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

    console.log('\n' + '='.repeat(80));
    console.log('✅ METADATA ACTUALIZADO EXITOSAMENTE');
    console.log('='.repeat(80));
    console.log(`\n📄 Archivo guardado: ${metadataPath}`);
    console.log(`📊 Total de screenshots: ${metadata.length}`);

    // Mostrar resumen por módulo
    const moduleCount = {};
    metadata.forEach(item => {
      moduleCount[item.moduleId] = (moduleCount[item.moduleId] || 0) + 1;
    });

    console.log('\n📋 Resumen por módulo:\n');
    Object.keys(moduleCount).sort().forEach(moduleId => {
      console.log(`   ${moduleId}: ${moduleCount[moduleId]} screenshots`);
    });

    // Identificar screenshots de mala calidad (< 50 KB)
    const lowQuality = metadata.filter(item => {
      const sizeMatch = item.size.match(/([0-9.]+)\s*KB/);
      if (sizeMatch) {
        const sizeKB = parseFloat(sizeMatch[1]);
        return sizeKB < 50;
      }
      return false;
    });

    if (lowQuality.length > 0) {
      console.log('\n⚠️  Screenshots de baja calidad detectados (< 50 KB):\n');
      lowQuality.forEach(item => {
        console.log(`   ❌ ${item.filename} (${item.size})`);
      });
      console.log('\n   💡 Considera recapturar estos screenshots en mayor calidad.');
    }

    console.log('\n='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ Error al actualizar metadata:', error.message);
    process.exit(1);
  }
}

// Ejecutar
main();

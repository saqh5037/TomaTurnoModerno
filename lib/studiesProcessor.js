/**
 * Procesador de Estudios para Integración LABSIS
 * Sistema TomaTurnoModerno - INER
 *
 * Este módulo maneja el procesamiento, parseo y agrupación de estudios
 * que vienen de LABSIS con información detallada de tubos/contenedores.
 */

import {
  convertLabsisStudiesToIner,
  groupStudiesByContainer,
  validateStudiesMapping
} from './labsisTubeMapping.js';

import {
  calculateTotalTubes,
  enrichTubesDetails,
  getTubeById
} from './tubesCatalog.js';

/**
 * Detectar formato de studies
 * @param {any} studies - Datos de estudios en cualquier formato
 * @returns {string} 'legacy_string' | 'legacy_array' | 'structured' | 'unknown'
 */
export function detectStudiesFormat(studies) {
  // Formato muy antiguo: array de strings simples
  if (Array.isArray(studies) && studies.length > 0 && typeof studies[0] === 'string') {
    return 'legacy_array';
  }

  // Formato nuevo: array de objetos con estructura completa
  if (Array.isArray(studies) && studies.length > 0 && typeof studies[0] === 'object') {
    // Si tiene campo 'container', es formato estructurado de LABSIS
    if (studies[0].container) {
      return 'structured';
    }
    // Si no tiene container pero tiene name, es formato intermedio
    if (studies[0].name) {
      return 'semi_structured';
    }
  }

  // Array vacío
  if (Array.isArray(studies) && studies.length === 0) {
    return 'empty_array';
  }

  // Formato string (posible JSON.stringify())
  if (typeof studies === 'string') {
    return 'legacy_string';
  }

  return 'unknown';
}

/**
 * Parsear studies desde cualquier formato a formato estructurado
 * @param {any} studies - Estudios en cualquier formato
 * @returns {Array} Array de estudios en formato estructurado
 */
export function parseStudies(studies) {
  const format = detectStudiesFormat(studies);

  switch (format) {
    case 'legacy_string':
      // Intentar parsear JSON
      try {
        const parsed = JSON.parse(studies);
        return parseStudies(parsed); // Recursión
      } catch (error) {
        console.warn('[studiesProcessor] Error parseando string JSON:', error);
        return [];
      }

    case 'legacy_array':
      // Convertir array de strings a objetos básicos
      return studies.map((name, index) => ({
        id: null,
        code: null,
        name: name,
        category: null,
        container: null, // Sin información de contenedor
        sample: null
      }));

    case 'semi_structured':
      // Ya tiene estructura básica pero sin contenedores completos
      return studies.map(study => ({
        id: study.id || null,
        code: study.code || null,
        name: study.name,
        category: study.category || null,
        container: study.container || null,
        sample: study.sample || null
      }));

    case 'structured':
      // Formato completo de LABSIS - retornar tal cual
      return studies;

    case 'empty_array':
      return [];

    case 'unknown':
    default:
      console.warn('[studiesProcessor] Formato desconocido de studies:', studies);
      return [];
  }
}

/**
 * Mapear estudios de LABSIS a formato INER
 * @param {Array} studies - Array de estudios (parseados)
 * @returns {Array} Estudios con contenedores mapeados a catálogo INER
 */
export function mapLabsisToInternalTubes(studies) {
  if (!Array.isArray(studies)) {
    console.warn('[studiesProcessor] mapLabsisToInternalTubes: studies no es array');
    return [];
  }

  // Si los estudios NO tienen contenedores, retornarlos sin mapeo
  const hasContainers = studies.some(s => s.container !== null && s.container !== undefined);
  if (!hasContainers) {
    console.info('[studiesProcessor] Estudios sin contenedores, no se aplicará mapeo');
    return studies;
  }

  // Aplicar mapeo usando labsisTubeMapping
  const mappedStudies = convertLabsisStudiesToIner(studies);

  // Validar mapeo
  const validation = validateStudiesMapping(mappedStudies);

  if (!validation.isValid) {
    console.error('[studiesProcessor] Errores en mapeo de tubos:', validation.errors);
  }

  if (validation.warnings.length > 0) {
    console.warn('[studiesProcessor] Advertencias en mapeo:', validation.warnings);
  }

  return mappedStudies;
}

/**
 * Generar tubesDetails desde estudios mapeados
 * @param {Array} mappedStudies - Estudios con contenedores mapeados
 * @returns {Array} Array de { type, quantity } para campo tubesDetails
 */
export function generateTubesDetails(mappedStudies) {
  if (!Array.isArray(mappedStudies) || mappedStudies.length === 0) {
    return [];
  }

  // Agrupar por contenedor
  const tubesDetails = groupStudiesByContainer(mappedStudies);

  // Validar que todos los tubos existan en el catálogo
  const validatedTubes = tubesDetails.filter(tube => {
    const catalogTube = getTubeById(tube.type);
    if (!catalogTube) {
      console.warn(`[studiesProcessor] Tubo no encontrado en catálogo: ${tube.type}`);
      return false;
    }
    return true;
  });

  return validatedTubes;
}

/**
 * Enriquecer estudios con información completa de tubos
 * @param {Array} studies - Estudios con contenedores básicos
 * @returns {Array} Estudios con información completa del catálogo INER
 */
export function enrichStudiesWithCatalog(studies) {
  if (!Array.isArray(studies)) return [];

  return studies.map(study => {
    if (!study.container || !study.container.id) {
      return study;
    }

    const catalogTube = getTubeById(study.container.id);
    if (!catalogTube) {
      return study;
    }

    return {
      ...study,
      container: {
        ...study.container,
        // Agregar/sobrescribir con info completa del catálogo
        code: catalogTube.code,
        name: catalogTube.name,
        fullName: catalogTube.fullName,
        color: catalogTube.color,
        colorHex: catalogTube.colorHex,
        description: catalogTube.description,
        uses: catalogTube.uses
      }
    };
  });
}

/**
 * Agrupar estudios para visualización/reporte
 * Agrupa estudios por tipo de contenedor con nombres de estudios
 * @param {Array} studies - Estudios procesados
 * @returns {Array} Tubos agrupados con lista de estudios
 */
export function groupStudiesForDisplay(studies) {
  if (!Array.isArray(studies) || studies.length === 0) {
    return [];
  }

  const groups = {};

  studies.forEach(study => {
    if (!study.container || !study.container.id) {
      // Agrupar estudios sin contenedor
      if (!groups['sin_contenedor']) {
        groups['sin_contenedor'] = {
          tubeName: 'Sin Contenedor Especificado',
          tubeColor: '#CCCCCC',
          tubeColorHex: '#CCCCCC',
          tubeId: null,
          quantity: 0,
          studies: []
        };
      }
      groups['sin_contenedor'].studies.push(study.name || 'Estudio sin nombre');
      return;
    }

    const containerId = study.container.id;

    if (!groups[containerId]) {
      groups[containerId] = {
        tubeName: study.container.name || study.container.type || 'Tubo',
        tubeColor: study.container.color || 'Gris',
        tubeColorHex: study.container.colorHex || '#808080',
        tubeId: containerId,
        quantity: 1,
        studies: []
      };
    }

    groups[containerId].studies.push(study.name || study.code || 'Estudio sin nombre');
  });

  // Convertir a array y ordenar por nombre de tubo
  return Object.values(groups).sort((a, b) =>
    a.tubeName.localeCompare(b.tubeName)
  );
}

/**
 * Procesar completamente los estudios desde LABSIS
 * Función principal que orquesta todo el flujo de procesamiento
 * @param {any} rawStudies - Estudios en cualquier formato desde LABSIS
 * @returns {Object} Objeto con estudios procesados y tubesDetails
 */
export function processStudiesComplete(rawStudies) {
  try {
    // 1. Parsear al formato estructurado
    const parsedStudies = parseStudies(rawStudies);

    // 2. Mapear tubos de LABSIS a catálogo INER
    const mappedStudies = mapLabsisToInternalTubes(parsedStudies);

    // 3. Enriquecer con información completa del catálogo
    const enrichedStudies = enrichStudiesWithCatalog(mappedStudies);

    // 4. Generar tubesDetails para almacenar en BD
    const tubesDetails = generateTubesDetails(enrichedStudies);

    // 5. Calcular total de tubos
    const tubesRequired = calculateTotalTubes(tubesDetails);

    // 6. Agrupar para visualización
    const tubesGrouped = groupStudiesForDisplay(enrichedStudies);

    return {
      success: true,
      studies: enrichedStudies,
      tubesDetails: tubesDetails,
      tubesRequired: tubesRequired,
      tubesGrouped: tubesGrouped,
      stats: {
        totalStudies: enrichedStudies.length,
        totalTubes: tubesRequired,
        uniqueTubeTypes: tubesDetails.length,
        studiesWithContainer: enrichedStudies.filter(s => s.container).length,
        studiesWithoutContainer: enrichedStudies.filter(s => !s.container).length
      }
    };
  } catch (error) {
    console.error('[studiesProcessor] Error procesando estudios:', error);
    return {
      success: false,
      error: error.message,
      studies: [],
      tubesDetails: [],
      tubesRequired: 0,
      tubesGrouped: [],
      stats: {
        totalStudies: 0,
        totalTubes: 0,
        uniqueTubeTypes: 0,
        studiesWithContainer: 0,
        studiesWithoutContainer: 0
      }
    };
  }
}

/**
 * Validar datos de entrada para creación de turno
 * @param {Object} turnData - Datos del turno
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export function validateTurnData(turnData) {
  const errors = [];

  if (!turnData.patientName || turnData.patientName.trim() === '') {
    errors.push('Nombre del paciente es requerido');
  }

  if (!turnData.age || turnData.age < 0 || turnData.age > 150) {
    errors.push('Edad del paciente debe estar entre 0 y 150');
  }

  if (!turnData.gender) {
    errors.push('Género del paciente es requerido');
  }

  if (!turnData.studies || (Array.isArray(turnData.studies) && turnData.studies.length === 0)) {
    errors.push('Debe especificar al menos un estudio');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generar resumen para logging/debugging
 * @param {Object} processedData - Resultado de processStudiesComplete
 * @returns {string} Resumen en texto
 */
export function generateProcessingSummary(processedData) {
  if (!processedData.success) {
    return `ERROR: ${processedData.error}`;
  }

  const { stats, tubesGrouped } = processedData;

  let summary = `Procesamiento exitoso:\n`;
  summary += `- Total de estudios: ${stats.totalStudies}\n`;
  summary += `- Estudios con contenedor: ${stats.studiesWithContainer}\n`;
  summary += `- Estudios sin contenedor: ${stats.studiesWithoutContainer}\n`;
  summary += `- Total de tubos: ${stats.totalTubes}\n`;
  summary += `- Tipos de tubos únicos: ${stats.uniqueTubeTypes}\n`;

  if (tubesGrouped.length > 0) {
    summary += `\nTubos necesarios:\n`;
    tubesGrouped.forEach(tube => {
      summary += `  • ${tube.tubeName} (${tube.tubeColor}) - ${tube.studies.length} estudio(s)\n`;
      tube.studies.forEach(studyName => {
        summary += `    - ${studyName}\n`;
      });
    });
  }

  return summary;
}

export default {
  detectStudiesFormat,
  parseStudies,
  mapLabsisToInternalTubes,
  generateTubesDetails,
  enrichStudiesWithCatalog,
  groupStudiesForDisplay,
  processStudiesComplete,
  validateTurnData,
  generateProcessingSummary
};

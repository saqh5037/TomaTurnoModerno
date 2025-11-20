/**
 * Mapeo entre Tubos de LABSIS y Catálogo INER
 * Sistema TomaTurnoModerno - INER
 *
 * Este módulo maneja la conversión bidireccional entre los identificadores
 * de tubos/contenedores usados en LABSIS y los del catálogo INER.
 */

import { getTubeById, getTubeByCode, TUBE_TYPES } from './tubesCatalog.js';

/**
 * Mapeo LABSIS → INER
 *
 * Estructura:
 * {
 *   labsisId: número (ID en tabla tipo_contenedor de LABSIS),
 *   labsisCode: string (abreviacion en LABSIS, ej: "TR", "TL"),
 *   labsisName: string (tipo en LABSIS, ej: "Tubo Tapa Roja"),
 *   inerId: string (ID en catálogo INER, ej: "rojo", "mor"),
 *   notes: string opcional (notas sobre el mapeo)
 * }
 */
export const LABSIS_TO_INER_MAPPING = [
  // TUBOS COMUNES - Códigos actualizados según tabla tipo_contenedor de LABSIS
  {
    labsisId: 1,
    labsisCode: 'ROJO',
    labsisName: 'TUBO TAPA ROJA',
    inerId: 'rojo',
    notes: 'Mapeo directo - tubo estándar para química clínica'
  },
  {
    labsisId: 2,
    labsisCode: 'MOR',
    labsisName: 'TUBO TAPA LILA',
    inerId: 'mor',
    notes: 'Mapeo directo - tubo para hematología (EDTA)'
  },
  {
    labsisId: 3,
    labsisCode: 'MORQ',
    labsisName: 'TUBO TAPA AMARILLA',
    inerId: 'morq',
    notes: 'Mapeo directo - tubo con gel separador para química'
  },
  {
    labsisId: 7,
    labsisCode: 'VERD',
    labsisName: 'TUBO TAPA VERDE',
    inerId: 'verd',
    notes: 'Mapeo directo - tubo para plasma (Heparina)'
  },
  {
    labsisId: 8,
    labsisCode: 'AZUL',
    labsisName: 'TUBO TAPA AZUL',
    inerId: 'azul',
    notes: 'Mapeo directo - tubo para coagulación (Citrato)'
  },

  // RECIPIENTES
  {
    labsisId: 5,
    labsisCode: 'EST',
    labsisName: 'RECIPIENTE ESTERIL',
    inerId: 'est',
    notes: 'Mapeo directo - contenedor estéril general'
  },
  {
    labsisId: 6,
    labsisCode: 'ESTL',
    labsisName: 'ESTERIL LIQUIDOS',
    inerId: 'estl',
    notes: 'Mapeo directo - contenedor para líquidos (LCR, etc.)'
  },
  {
    labsisId: 10,
    labsisCode: 'GARR',
    labsisName: 'RECOLECCIÓN ORINA',
    inerId: 'garr',
    notes: 'Mapeo directo - recolección de orina'
  },

  // TUBOS ESPECIALIZADOS
  {
    labsisId: 4,
    labsisCode: 'ORI',
    labsisName: 'TUBO CONICO',
    inerId: 'ori',
    notes: 'Mapeo directo - tubo cónico general'
  },
  {
    labsisId: 16,
    labsisCode: 'EGO',
    labsisName: 'TUBO CONICO',
    inerId: 'ego',
    notes: 'Tubo específico para examen general de orina'
  },
  {
    labsisId: 9,
    labsisCode: 'HIS',
    labsisName: 'HISOPO',
    inerId: 'his',
    notes: 'Mapeo directo - hisopo para muestras'
  },
  {
    labsisId: 11,
    labsisCode: 'LAM',
    labsisName: 'LAMINILLA',
    inerId: 'lam',
    notes: 'Mapeo directo - laminilla para microscopía'
  },
  {
    labsisId: 13,
    labsisCode: 'EST2',
    labsisName: 'RECIPIENTE ESTERIL 2',
    inerId: 'est2',
    notes: 'Recipiente estéril adicional'
  },
  {
    labsisId: 14,
    labsisCode: 'EST3',
    labsisName: 'RECIPIENTE ESTERIL 3',
    inerId: 'est3',
    notes: 'Recipiente estéril adicional'
  },

  // TUBOS ESPECIALES CON CÓDIGOS ESPECÍFICOS
  {
    labsisId: 15,
    labsisCode: 'MORQ',
    labsisName: 'TUBO TAPA LILA Q',
    inerId: 'morq',
    notes: 'Variante tubo lila (mapea a amarillo INER)'
  },
  {
    labsisId: 17,
    labsisCode: 'MORI',
    labsisName: 'TUBO TAPA LILA I',
    inerId: 'mor',
    notes: 'Variante tubo lila inmunología'
  },
  {
    labsisId: 18,
    labsisCode: 'AMA2',
    labsisName: 'TUBO TAPA AMARILLA II',
    inerId: 'morq',
    notes: 'Variante tubo amarillo'
  },
  {
    labsisId: 19,
    labsisCode: 'MORQ',
    labsisName: 'TUBO TAPA AMARILLA INM',
    inerId: 'morq',
    notes: 'Tubo amarillo inmunología'
  },
  {
    labsisId: 21,
    labsisCode: 'B12',
    labsisName: 'TUBO TAPA AMARILLA B12',
    inerId: 'morq',
    notes: 'Tubo específico para vitamina B12'
  },
  {
    labsisId: 22,
    labsisCode: 'PTH',
    labsisName: 'TUBO TAPA AMARILLA PTH',
    inerId: 'morq',
    notes: 'Tubo específico para hormona paratiroidea'
  },
  {
    labsisId: 23,
    labsisCode: 'TABM',
    labsisName: 'TUBO TAPA AMARILLA BM',
    inerId: 'morq',
    notes: 'Tubo amarillo para biomarcadores'
  },
  {
    labsisId: 24,
    labsisCode: 'MOBMD',
    labsisName: 'TUBO TAPA LILA BM D',
    inerId: 'mor',
    notes: 'Tubo lila biomarcadores D'
  },
  {
    labsisId: 25,
    labsisCode: 'MOBMR',
    labsisName: 'TUBO TAPA LILA BM R',
    inerId: 'mor',
    notes: 'Tubo lila biomarcadores R'
  },
  {
    labsisId: 26,
    labsisCode: 'ACDBM',
    labsisName: 'TUBO ACD',
    inerId: 'otro',
    notes: 'Tubo ACD para biomarcadores'
  },
  {
    labsisId: 27,
    labsisCode: 'INMSUP',
    labsisName: 'TUBO TAPA LILA INM SUP',
    inerId: 'mor',
    notes: 'Tubo lila inmunología supervisor'
  },
  {
    labsisId: 28,
    labsisCode: 'ROJO',
    labsisName: 'TUBO TAPA ROJA',
    inerId: 'rojo',
    notes: 'Tubo rojo duplicado'
  },
  {
    labsisId: 29,
    labsisCode: 'ROJO',
    labsisName: 'TUBO TAPA ROJA VANCO',
    inerId: 'rojo',
    notes: 'Tubo rojo para vancomicina'
  },
  {
    labsisId: 30,
    labsisCode: 'NGAL',
    labsisName: 'RECOLECCION ORINA NGAL',
    inerId: 'garr',
    notes: 'Recolección orina para NGAL'
  },
  {
    labsisId: 31,
    labsisCode: 'EBV',
    labsisName: 'TUBO TAPA AMARILLA EBV',
    inerId: 'morq',
    notes: 'Tubo amarillo para Epstein-Barr'
  },
  {
    labsisId: 32,
    labsisCode: 'HERP',
    labsisName: 'TUBO AMARILLO HERP',
    inerId: 'morq',
    notes: 'Tubo amarillo para herpes'
  },
  {
    labsisId: 33,
    labsisCode: 'HORM',
    labsisName: 'TUBO TAPA AMARILLA HORM',
    inerId: 'morq',
    notes: 'Tubo amarillo para hormonas'
  },
  {
    labsisId: 34,
    labsisCode: 'ALFA1A',
    labsisName: 'TUBO TAPA AMARILLA ALFA 1',
    inerId: 'morq',
    notes: 'Tubo amarillo para alfa-1 antitripsina'
  },
  {
    labsisId: 35,
    labsisCode: 'AAVIAR',
    labsisName: 'TUBO TAPA AMARILLA AVIAR',
    inerId: 'morq',
    notes: 'Tubo amarillo para antígenos aviares'
  },
  {
    labsisId: 36,
    labsisCode: 'VITD',
    labsisName: 'TUBO TAPA AMARILLA VIT D',
    inerId: 'morq',
    notes: 'Tubo amarillo para vitamina D'
  },
  {
    labsisId: 37,
    labsisCode: 'SRP',
    labsisName: 'TUBO TAPA AMARILLA SRP',
    inerId: 'morq',
    notes: 'Tubo amarillo para proteínas séricas'
  },
  {
    labsisId: 38,
    labsisCode: 'VVZ',
    labsisName: 'TUBO TAPA AMARILLA VVZ',
    inerId: 'morq',
    notes: 'Tubo amarillo para varicela-zoster'
  },
  {
    labsisId: 39,
    labsisCode: 'ELAST',
    labsisName: 'RECIPIENTE ESTERIL ELASTASA',
    inerId: 'est',
    notes: 'Recipiente estéril para elastasa'
  },

  // CASOS ESPECIALES
  {
    labsisId: 20,
    labsisCode: 'REF',
    labsisName: 'REFERIDA',
    inerId: 'otro',
    notes: 'Muestra referida - sin contenedor específico'
  },
  {
    labsisId: 12,
    labsisCode: 'OTRO',
    labsisName: 'OTRO',
    inerId: 'otro',
    notes: 'Contenedor no especificado - mapeo genérico'
  }
];

/**
 * Obtener mapeo por ID de LABSIS
 * @param {number} labsisId - ID del tubo en LABSIS
 * @returns {Object|null} Objeto de mapeo o null si no existe
 */
export function getMappingByLabsisId(labsisId) {
  return LABSIS_TO_INER_MAPPING.find(m => m.labsisId === labsisId) || null;
}

/**
 * Obtener mapeo por código de LABSIS
 * @param {string} labsisCode - Código/abreviación en LABSIS (ej: "TR", "TL")
 * @returns {Object|null} Objeto de mapeo o null si no existe
 */
export function getMappingByLabsisCode(labsisCode) {
  const code = labsisCode?.toUpperCase();
  return LABSIS_TO_INER_MAPPING.find(m => m.labsisCode === code) || null;
}

/**
 * Obtener mapeo por ID de INER
 * @param {string} inerId - ID del tubo en catálogo INER (ej: "rojo", "mor")
 * @returns {Object|null} Objeto de mapeo o null si no existe
 */
export function getMappingByInerId(inerId) {
  return LABSIS_TO_INER_MAPPING.find(m => m.inerId === inerId) || null;
}

/**
 * Convertir ID/código de LABSIS a ID de INER
 * @param {number|string} labsisIdentifier - ID numérico o código string de LABSIS
 * @returns {string|null} ID de INER o null si no hay mapeo
 */
export function labsisToIner(labsisIdentifier) {
  if (typeof labsisIdentifier === 'number') {
    const mapping = getMappingByLabsisId(labsisIdentifier);
    return mapping ? mapping.inerId : null;
  }

  if (typeof labsisIdentifier === 'string') {
    const mapping = getMappingByLabsisCode(labsisIdentifier);
    return mapping ? mapping.inerId : null;
  }

  return null;
}

/**
 * Convertir ID de INER a ID/código de LABSIS
 * @param {string} inerId - ID del tubo en catálogo INER
 * @returns {Object|null} Objeto con { labsisId, labsisCode } o null
 */
export function inerToLabsis(inerId) {
  const mapping = getMappingByInerId(inerId);
  if (!mapping) return null;

  return {
    labsisId: mapping.labsisId,
    labsisCode: mapping.labsisCode,
    labsisName: mapping.labsisName
  };
}

/**
 * Convertir información completa de contenedor de LABSIS a formato INER
 * @param {Object} labsisContainer - Objeto con datos del contenedor de LABSIS
 * @param {number} labsisContainer.id - ID en LABSIS
 * @param {string} labsisContainer.type - Nombre del tipo
 * @param {string} labsisContainer.abbreviation - Código/abreviación
 * @param {string} labsisContainer.color - Color (opcional)
 * @returns {Object|null} Objeto completo del catálogo INER o null
 */
export function convertLabsisContainerToIner(labsisContainer) {
  if (!labsisContainer) return null;

  // Intentar mapear por ID primero, luego por código
  let inerId = null;

  if (labsisContainer.id) {
    inerId = labsisToIner(labsisContainer.id);
  }

  if (!inerId && labsisContainer.abbreviation) {
    inerId = labsisToIner(labsisContainer.abbreviation);
  }

  // Si no encontramos mapeo, intentar por nombre similar
  if (!inerId && labsisContainer.type) {
    inerId = findInerTubeByName(labsisContainer.type);
  }

  if (!inerId) {
    console.warn(`[labsisTubeMapping] No se encontró mapeo para:`, labsisContainer);
    return null;
  }

  // Obtener información completa del catálogo INER
  const inerTube = getTubeById(inerId);
  if (!inerTube) {
    console.warn(`[labsisTubeMapping] Tubo INER no encontrado para ID: ${inerId}`);
    return null;
  }

  // Agregar información original de LABSIS para trazabilidad
  return {
    ...inerTube,
    labsisId: labsisContainer.id,
    labsisCode: labsisContainer.abbreviation,
    labsisName: labsisContainer.type,
    labsisColor: labsisContainer.color
  };
}

/**
 * Buscar tubo INER por similitud de nombre
 * @param {string} labsisName - Nombre del tubo en LABSIS
 * @returns {string|null} ID de INER o null
 */
function findInerTubeByName(labsisName) {
  const normalized = labsisName.toLowerCase().trim();

  // Mapeo por palabras clave en el nombre
  const namePatterns = {
    'rojo': ['rojo', 'red'],
    'mor': ['lila', 'morado', 'edta', 'purple'],
    'morq': ['amarillo', 'amarilla', 'yellow', 'gel'],
    'verd': ['verde', 'heparina', 'green'],
    'azul': ['azul', 'citrato', 'blue'],
    'est': ['estéril', 'esteril', 'sterile'],
    'garr': ['orina', 'urine'],
    'his': ['hisopo', 'swab'],
    'lam': ['laminilla', 'slide']
  };

  for (const [inerId, keywords] of Object.entries(namePatterns)) {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      return inerId;
    }
  }

  return null;
}

/**
 * Convertir array de estudios de LABSIS con contenedores a formato INER
 * @param {Array} labsisStudies - Array de estudios de LABSIS con formato:
 *   [{ id, name, container: { id, type, abbreviation, color }, ... }]
 * @returns {Array} Array de estudios con tubos mapeados a INER
 */
export function convertLabsisStudiesToIner(labsisStudies) {
  if (!Array.isArray(labsisStudies)) {
    console.warn('[labsisTubeMapping] labsisStudies no es un array:', labsisStudies);
    return [];
  }

  return labsisStudies.map(study => {
    if (!study.container) {
      console.warn('[labsisTubeMapping] Estudio sin contenedor:', study);
      return {
        ...study,
        container: null,
        _mappingError: 'NO_CONTAINER'
      };
    }

    const inerContainer = convertLabsisContainerToIner(study.container);

    if (!inerContainer) {
      return {
        ...study,
        container: study.container, // Mantener original si no hay mapeo
        _mappingError: 'NO_MAPPING_FOUND'
      };
    }

    return {
      ...study,
      container: inerContainer
    };
  });
}

/**
 * Agrupar estudios por tipo de contenedor para generar tubesDetails
 * @param {Array} studies - Array de estudios con contenedores mapeados
 * @returns {Array} Array de { type, quantity } para tubesDetails
 */
export function groupStudiesByContainer(studies) {
  if (!Array.isArray(studies)) return [];

  const containerCounts = {};

  studies.forEach(study => {
    if (!study.container || !study.container.id) {
      console.warn('[labsisTubeMapping] Estudio sin contenedor válido:', study);
      return;
    }

    const containerId = study.container.id;
    containerCounts[containerId] = (containerCounts[containerId] || 0) + 1;
  });

  // Convertir a formato tubesDetails
  return Object.entries(containerCounts).map(([containerId, count]) => ({
    type: containerId,
    quantity: count
  }));
}

/**
 * Validar que todos los estudios tengan mapeo válido
 * @param {Array} studies - Array de estudios procesados
 * @returns {Object} { isValid: boolean, errors: Array, warnings: Array }
 */
export function validateStudiesMapping(studies) {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(studies)) {
    errors.push('studies no es un array');
    return { isValid: false, errors, warnings };
  }

  studies.forEach((study, index) => {
    if (!study.container) {
      errors.push(`Estudio ${index + 1} ("${study.name}") no tiene contenedor`);
    } else if (study._mappingError) {
      errors.push(`Estudio ${index + 1} ("${study.name}"): ${study._mappingError}`);
    } else if (!study.container.id) {
      warnings.push(`Estudio ${index + 1} ("${study.name}"): contenedor sin ID`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Obtener estadísticas de mapeo
 * @returns {Object} Estadísticas del mapeo disponible
 */
export function getMappingStats() {
  return {
    totalMappings: LABSIS_TO_INER_MAPPING.length,
    labsisIds: LABSIS_TO_INER_MAPPING.map(m => m.labsisId),
    labsisCodes: LABSIS_TO_INER_MAPPING.map(m => m.labsisCode),
    inerIds: LABSIS_TO_INER_MAPPING.map(m => m.inerId),
    inerCatalogTotal: TUBE_TYPES.length,
    coveragePercent: Math.round((LABSIS_TO_INER_MAPPING.length / TUBE_TYPES.length) * 100)
  };
}

export default {
  LABSIS_TO_INER_MAPPING,
  getMappingByLabsisId,
  getMappingByLabsisCode,
  getMappingByInerId,
  labsisToIner,
  inerToLabsis,
  convertLabsisContainerToIner,
  convertLabsisStudiesToIner,
  groupStudiesByContainer,
  validateStudiesMapping,
  getMappingStats
};

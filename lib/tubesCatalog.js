/**
 * Catálogo de Tipos de Contenedores/Tubos de Laboratorio
 * Sistema TomaTurnoModerno - INER
 *
 * Catálogo oficial basado en contenedores_INER.csv
 * Incluye 43 tipos de tubos y contenedores utilizados en el INER
 */

export const TUBE_TYPES = [
  {
    id: 'rojo',
    code: 'ROJO',
    name: 'Tubo Tapa Roja',
    fullName: 'Tubo Tapa Roja',
    color: 'Rojo',
    colorHex: '#fc181e',
    csvId: 1,
    description: 'Para pruebas de química clínica y serología',
    uses: ['Química clínica', 'Serología', 'Banco de sangre']
  },
  {
    id: 'mor',
    code: 'MOR',
    name: 'Tubo Tapa Lila',
    fullName: 'Tubo Tapa Lila (EDTA)',
    color: 'Lila/Morado',
    colorHex: '#d510da',
    csvId: 2,
    description: 'Para pruebas hematológicas completas',
    uses: ['Biometría hemática', 'Hematología']
  },
  {
    id: 'morq',
    code: 'MORQ',
    name: 'Tubo Tapa Amarilla',
    fullName: 'Tubo Tapa Amarilla',
    color: 'Amarillo',
    colorHex: '#f7e71e',
    csvId: 3,
    description: 'Para química clínica con gel separador',
    uses: ['Química clínica', 'Hormonas', 'Marcadores']
  },
  {
    id: 'ori',
    code: 'ORI',
    name: 'Tubo Cónico',
    fullName: 'Tubo Cónico',
    color: 'Amarillo',
    colorHex: '#eaef25',
    csvId: 4,
    description: 'Tubo cónico para muestras generales',
    uses: ['Muestras generales', 'Almacenamiento']
  },
  {
    id: 'est',
    code: 'EST',
    name: 'Recipiente Estéril',
    fullName: 'Recipiente Estéril',
    color: 'Azul claro',
    colorHex: '#dfeffd',
    csvId: 5,
    description: 'Recipiente estéril para muestras',
    uses: ['Microbiología', 'Cultivos']
  },
  {
    id: 'estl',
    code: 'ESTL',
    name: 'Estéril Líquidos',
    fullName: 'Recipiente Estéril para Líquidos',
    color: 'Naranja',
    colorHex: '#ff8000',
    csvId: 6,
    description: 'Recipiente estéril para líquidos',
    uses: ['Líquidos corporales', 'Cultivos']
  },
  {
    id: 'verd',
    code: 'VERD',
    name: 'Tubo Tapa Verde',
    fullName: 'Tubo Tapa Verde (Heparina)',
    color: 'Verde',
    colorHex: '#30e439',
    csvId: 7,
    description: 'Para química clínica en plasma',
    uses: ['Química en plasma', 'Electrolitos', 'Gasometría']
  },
  {
    id: 'azul',
    code: 'AZUL',
    name: 'Tubo Tapa Azul',
    fullName: 'Tubo Tapa Azul (Citrato)',
    color: 'Azul',
    colorHex: '#7ec1f8',
    csvId: 8,
    description: 'Para pruebas de coagulación',
    uses: ['Tiempo de protrombina', 'TPT', 'Coagulación']
  },
  {
    id: 'his',
    code: 'HIS',
    name: 'Hisopo',
    fullName: 'Hisopo',
    color: 'Gris',
    colorHex: '#e6e6e6',
    csvId: 9,
    description: 'Hisopo para muestras',
    uses: ['Cultivos', 'Microbiología']
  },
  {
    id: 'garr',
    code: 'GARR',
    name: 'Recolección Orina',
    fullName: 'Recipiente para Recolección de Orina',
    color: 'Amarillo',
    colorHex: '#ede327',
    csvId: 10,
    description: 'Contenedor para recolección de orina',
    uses: ['Examen general de orina', 'Urocultivo']
  },
  {
    id: 'lam',
    code: 'LAM',
    name: 'Laminilla',
    fullName: 'Laminilla',
    color: 'Azul',
    colorHex: '#2196F3',
    csvId: 11,
    description: 'Laminilla para microscopía',
    uses: ['Microscopía', 'Citología']
  },
  {
    id: 'otro',
    code: 'OTRO',
    name: 'Otro',
    fullName: 'Otro Tipo de Contenedor',
    color: 'Negro',
    colorHex: '#01070c',
    csvId: 12,
    description: 'Otro tipo de contenedor no especificado',
    uses: ['Diversos']
  },
  {
    id: 'est2',
    code: 'EST2',
    name: 'Recipiente Estéril 2',
    fullName: 'Recipiente Estéril 2',
    color: 'Blanco',
    colorHex: '#f5f5f5',
    csvId: 13,
    description: 'Recipiente estéril adicional',
    uses: ['Microbiología', 'Cultivos']
  },
  {
    id: 'est3',
    code: 'EST3',
    name: 'Recipiente Estéril 3',
    fullName: 'Recipiente Estéril 3',
    color: 'Blanco',
    colorHex: '#f5f5f5',
    csvId: 14,
    description: 'Recipiente estéril adicional',
    uses: ['Microbiología', 'Cultivos']
  },
  {
    id: 'morq2',
    code: 'MORQ',
    name: 'Tubo Tapa Lila Q',
    fullName: 'Tubo Tapa Lila Q',
    color: 'Lila',
    colorHex: '#d510da',
    csvId: 15,
    description: 'Tubo tapa lila especial',
    uses: ['Hematología especializada']
  },
  {
    id: 'ego',
    code: 'EGO',
    name: 'Tubo Cónico EGO',
    fullName: 'Tubo Cónico para EGO',
    color: 'Amarillo',
    colorHex: '#eaef25',
    csvId: 16,
    description: 'Tubo cónico para examen general de orina',
    uses: ['Examen general de orina']
  },
  {
    id: 'mori',
    code: 'MORI',
    name: 'Tubo Tapa Lila I',
    fullName: 'Tubo Tapa Lila I',
    color: 'Lila',
    colorHex: '#d510da',
    csvId: 17,
    description: 'Tubo tapa lila tipo I',
    uses: ['Hematología especializada']
  },
  {
    id: 'ama2',
    code: 'AMA2',
    name: 'Tubo Tapa Amarilla II',
    fullName: 'Tubo Tapa Amarilla II',
    color: 'Amarillo',
    colorHex: '#f7e71e',
    csvId: 18,
    description: 'Tubo tapa amarilla tipo II',
    uses: ['Química clínica especializada']
  },
  {
    id: 'morq_inm',
    code: 'MORQ',
    name: 'Tubo Tapa Amarilla INM',
    fullName: 'Tubo Tapa Amarilla Inmunología',
    color: 'Amarillo',
    colorHex: '#f7e71e',
    csvId: 19,
    description: 'Tubo para pruebas de inmunología',
    uses: ['Inmunología']
  },
  {
    id: 'ref',
    code: 'REF',
    name: 'Referida',
    fullName: 'Muestra Referida',
    color: 'Gris',
    colorHex: '#808080',
    csvId: 20,
    description: 'Muestra referida de otro laboratorio',
    uses: ['Referencia externa']
  },
  {
    id: 'b12',
    code: 'B12',
    name: 'Tubo Tapa Amarilla B12',
    fullName: 'Tubo Tapa Amarilla para Vitamina B12',
    color: 'Amarillo brillante',
    colorHex: '#ebfb04',
    csvId: 21,
    description: 'Tubo para determinación de vitamina B12',
    uses: ['Vitamina B12']
  },
  {
    id: 'pth',
    code: 'PTH',
    name: 'Tubo Tapa Amarilla PTH',
    fullName: 'Tubo Tapa Amarilla para PTH',
    color: 'Amarillo',
    colorHex: '#f7ef08',
    csvId: 22,
    description: 'Tubo para hormona paratiroidea',
    uses: ['PTH', 'Hormona paratiroidea']
  },
  {
    id: 'tabm',
    code: 'TABM',
    name: 'Tubo Tapa Amarilla BM',
    fullName: 'Tubo Tapa Amarilla Banco de Médula',
    color: 'Amarillo',
    colorHex: '#f7ef08',
    csvId: 23,
    description: 'Tubo para banco de médula',
    uses: ['Banco de médula']
  },
  {
    id: 'mobmd',
    code: 'MOBMD',
    name: 'Tubo Tapa Lila BM D',
    fullName: 'Tubo Tapa Lila Banco Médula Donador',
    color: 'Lila',
    colorHex: '#d510da',
    csvId: 24,
    description: 'Tubo banco médula donador',
    uses: ['Banco de médula - Donador']
  },
  {
    id: 'mobmr',
    code: 'MOBMR',
    name: 'Tubo Tapa Lila BM R',
    fullName: 'Tubo Tapa Lila Banco Médula Receptor',
    color: 'Lila',
    colorHex: '#d510da',
    csvId: 25,
    description: 'Tubo banco médula receptor',
    uses: ['Banco de médula - Receptor']
  },
  {
    id: 'acdbm',
    code: 'ACDBM',
    name: 'Tubo ACD',
    fullName: 'Tubo ACD Banco de Médula',
    color: 'Amarillo',
    colorHex: '#f7ef08',
    csvId: 26,
    description: 'Tubo ACD para banco de médula',
    uses: ['Banco de médula', 'ACD']
  },
  {
    id: 'inmsup',
    code: 'INMSUP',
    name: 'Tubo Tapa Lila INM SUP',
    fullName: 'Tubo Tapa Lila Inmunología Superior',
    color: 'Lila',
    colorHex: '#d510da',
    csvId: 27,
    description: 'Tubo inmunología especializada',
    uses: ['Inmunología especializada']
  },
  {
    id: 'rojo2',
    code: 'ROJO',
    name: 'Tubo Tapa Roja',
    fullName: 'Tubo Tapa Roja',
    color: 'Rojo',
    colorHex: '#fc181e',
    csvId: 28,
    description: 'Tubo tapa roja adicional',
    uses: ['Química clínica', 'Serología']
  },
  {
    id: 'rojo_vanco',
    code: 'ROJO',
    name: 'Tubo Tapa Roja VANCO',
    fullName: 'Tubo Tapa Roja para Vancomicina',
    color: 'Rojo',
    colorHex: '#fc181e',
    csvId: 29,
    description: 'Tubo para niveles de vancomicina',
    uses: ['Vancomicina', 'Monitoreo terapéutico']
  },
  {
    id: 'ngal',
    code: 'NGAL',
    name: 'Recolección Orina NGAL',
    fullName: 'Recolección Orina NGAL',
    color: 'Transparente',
    colorHex: '#f0f0f0',
    csvId: 30,
    description: 'Recipiente para NGAL en orina',
    uses: ['NGAL', 'Biomarcadores renales']
  },
  {
    id: 'ebv',
    code: 'EBV',
    name: 'Tubo Tapa Amarilla EBV',
    fullName: 'Tubo Tapa Amarilla Epstein-Barr',
    color: 'Amarillo',
    colorHex: '#f7e71e',
    csvId: 31,
    description: 'Tubo para virus Epstein-Barr',
    uses: ['Epstein-Barr', 'Serología viral']
  },
  {
    id: 'herp',
    code: 'HERP',
    name: 'Tubo Amarillo HERP',
    fullName: 'Tubo Amarillo Herpes',
    color: 'Amarillo',
    colorHex: '#f7e71e',
    csvId: 32,
    description: 'Tubo para virus herpes',
    uses: ['Herpes', 'Serología viral']
  },
  {
    id: 'horm',
    code: 'HORM',
    name: 'Tubo Tapa Amarilla HORM',
    fullName: 'Tubo Tapa Amarilla Hormonas',
    color: 'Amarillo',
    colorHex: '#f7e71e',
    csvId: 33,
    description: 'Tubo para perfil hormonal',
    uses: ['Perfil hormonal', 'Endocrinología']
  },
  {
    id: 'alfa1a',
    code: 'ALFA1A',
    name: 'Tubo Tapa Amarilla Alfa 1',
    fullName: 'Tubo Tapa Amarilla Alfa 1 Antitripsina',
    color: 'Amarillo',
    colorHex: '#f7e71e',
    csvId: 34,
    description: 'Tubo para alfa 1 antitripsina',
    uses: ['Alfa 1 antitripsina']
  },
  {
    id: 'aaviar',
    code: 'AAVIAR',
    name: 'Tubo Tapa Amarilla AVIAR',
    fullName: 'Tubo Tapa Amarilla Influenza Aviar',
    color: 'Amarillo',
    colorHex: '#f7e71e',
    csvId: 35,
    description: 'Tubo para influenza aviar',
    uses: ['Influenza aviar', 'Serología']
  },
  {
    id: 'vitd',
    code: 'VITD',
    name: 'Tubo Tapa Amarilla VIT D',
    fullName: 'Tubo Tapa Amarilla Vitamina D',
    color: 'Amarillo',
    colorHex: '#f7e71e',
    csvId: 36,
    description: 'Tubo para vitamina D',
    uses: ['Vitamina D']
  },
  {
    id: 'srp',
    code: 'SRP',
    name: 'Tubo Tapa Amarilla SRP',
    fullName: 'Tubo Tapa Amarilla Sarampión-Rubeola-Parotiditis',
    color: 'Amarillo',
    colorHex: '#f7e71e',
    csvId: 37,
    description: 'Tubo para SRP',
    uses: ['Sarampión', 'Rubeola', 'Parotiditis']
  },
  {
    id: 'vvz',
    code: 'VVZ',
    name: 'Tubo Tapa Amarilla VVZ',
    fullName: 'Tubo Tapa Amarilla Varicela Zoster',
    color: 'Amarillo',
    colorHex: '#f7e71e',
    csvId: 38,
    description: 'Tubo para varicela zoster',
    uses: ['Varicela', 'Herpes zoster']
  },
  {
    id: 'elast',
    code: 'ELAST',
    name: 'Recipiente Estéril Elastasa',
    fullName: 'Recipiente Estéril para Elastasa',
    color: 'Blanco',
    colorHex: '#f5f5f5',
    csvId: 39,
    description: 'Recipiente para elastasa fecal',
    uses: ['Elastasa fecal']
  },
  {
    id: 'amoni',
    code: 'AMONI',
    name: 'Tubo Tapa Lila Amonio',
    fullName: 'Tubo Tapa Lila para Amonio',
    color: 'Lila',
    colorHex: '#d510da',
    csvId: 40,
    description: 'Tubo para determinación de amonio',
    uses: ['Amonio', 'Química clínica']
  },
  {
    id: 'co12h',
    code: 'CO12H',
    name: 'Contenedor Orina 12HRS',
    fullName: 'Contenedor Orina 12 Horas',
    color: 'Amarillo',
    colorHex: '#f7ef08',
    csvId: 41,
    description: 'Contenedor para orina de 12 horas',
    uses: ['Orina 12 horas']
  },
  {
    id: 'co24h',
    code: 'CO24H',
    name: 'Contenedor Orina 24HRS',
    fullName: 'Contenedor Orina 24 Horas',
    color: 'Amarillo',
    colorHex: '#f7ef08',
    csvId: 42,
    description: 'Contenedor para orina de 24 horas',
    uses: ['Orina 24 horas']
  },
  {
    id: 'corto24',
    code: 'CORTO24',
    name: 'Cortisol Orina 24',
    fullName: 'Contenedor Cortisol Orina 24 Horas',
    color: 'Amarillo',
    colorHex: '#f7ef08',
    csvId: 43,
    description: 'Contenedor para cortisol en orina 24 horas',
    uses: ['Cortisol urinario', 'Orina 24 horas']
  }
];

/**
 * Obtener tubo por ID
 * @param {string} id - ID del tubo
 * @returns {Object|null} Objeto del tubo o null si no existe
 */
export function getTubeById(id) {
  return TUBE_TYPES.find(tube => tube.id === id) || null;
}

/**
 * Obtener tubo por código
 * @param {string} code - Código del tubo (ej: 'ROJO', 'MOR')
 * @returns {Object|null} Objeto del tubo o null si no existe
 */
export function getTubeByCode(code) {
  return TUBE_TYPES.find(tube => tube.code === code.toUpperCase()) || null;
}

/**
 * Obtener tubo por CSV ID (para compatibilidad con sistema INER)
 * @param {number} csvId - ID del CSV original
 * @returns {Object|null} Objeto del tubo o null si no existe
 */
export function getTubeByCsvId(csvId) {
  return TUBE_TYPES.find(tube => tube.csvId === csvId) || null;
}

/**
 * Calcular total de tubos desde array de detalles
 * @param {Array} tubesDetails - Array de objetos con { type, quantity }
 * @returns {number} Total de tubos
 */
export function calculateTotalTubes(tubesDetails) {
  if (!tubesDetails || !Array.isArray(tubesDetails)) {
    return 0;
  }

  return tubesDetails.reduce((total, tube) => {
    return total + (parseInt(tube.quantity) || 0);
  }, 0);
}

/**
 * Validar estructura de tubesDetails
 * @param {Array} tubesDetails - Array de objetos con { type, quantity }
 * @returns {boolean} true si es válido
 */
export function validateTubesDetails(tubesDetails) {
  if (!Array.isArray(tubesDetails)) {
    return false;
  }

  return tubesDetails.every(tube => {
    const validTube = getTubeById(tube.type);
    return validTube &&
           typeof tube.quantity === 'number' &&
           tube.quantity > 0 &&
           tube.quantity <= 10;
  });
}

/**
 * Enriquecer tubesDetails con información completa del catálogo
 * @param {Array} tubesDetails - Array simplificado con { type, quantity }
 * @returns {Array} Array enriquecido con toda la info del catálogo
 */
export function enrichTubesDetails(tubesDetails) {
  if (!tubesDetails || !Array.isArray(tubesDetails)) {
    return [];
  }

  return tubesDetails.map(tube => {
    const catalogTube = getTubeById(tube.type);
    if (!catalogTube) {
      return null;
    }

    return {
      type: tube.type,
      code: catalogTube.code,
      name: catalogTube.name,
      color: catalogTube.color,
      colorHex: catalogTube.colorHex,
      quantity: tube.quantity,
      sampleType: tube.sampleType || null  // Preservar sampleType de LABSIS
    };
  }).filter(Boolean); // Remover nulls
}

/**
 * Obtener lista de tubos para select/dropdown
 * @returns {Array} Array de opciones para select
 */
export function getTubesSelectOptions() {
  return TUBE_TYPES.map(tube => ({
    value: tube.id,
    label: `${tube.color} - ${tube.name}`,
    color: tube.colorHex
  }));
}

/**
 * Migrar dato legacy (formatos antiguos) a formato nuevo
 * @param {number|string} legacyData - Dato en formato antiguo
 * @returns {Array} Array con formato nuevo
 */
export function migrateLegacyTubesData(legacyData) {
  // Si es un número (formato muy antiguo - solo cantidad)
  if (typeof legacyData === 'number') {
    if (legacyData === 0) return [];
    // Por defecto, asignar como tubos rojos (más común)
    return [{ type: 'rojo', quantity: legacyData }];
  }

  // Si es string con tipo antiguo (sst, edta, etc.) - mapear a nuevos tipos
  const legacyTypeMap = {
    'sst': 'morq',           // SST → Tubo amarillo
    'edta': 'mor',           // EDTA → Tubo lila
    'citrato': 'azul',       // Citrato → Tubo azul
    'fluoruro': 'morq',      // Fluoruro → Tubo amarillo
    'heparina': 'verd',      // Heparina → Tubo verde
    'sin_aditivo': 'rojo',   // Sin aditivo → Tubo rojo
    'gel_separator': 'morq'  // Gel separador → Tubo amarillo
  };

  if (typeof legacyData === 'string' && legacyTypeMap[legacyData]) {
    return [{ type: legacyTypeMap[legacyData], quantity: 1 }];
  }

  // Si ya es un array, retornarlo
  if (Array.isArray(legacyData)) {
    return legacyData.map(item => {
      if (legacyTypeMap[item.type]) {
        return { ...item, type: legacyTypeMap[item.type] };
      }
      return item;
    });
  }

  return [];
}

/**
 * Obtener tubos agrupados por categoría
 * @returns {Object} Objeto con tubos agrupados
 */
export function getTubesGrouped() {
  return {
    comunes: TUBE_TYPES.filter(t =>
      ['rojo', 'mor', 'morq', 'verd', 'azul', 'garr', 'ori'].includes(t.id)
    ),
    especializados: TUBE_TYPES.filter(t =>
      !['rojo', 'mor', 'morq', 'verd', 'azul', 'garr', 'ori', 'est', 'estl', 'est2', 'est3', 'his', 'lam', 'otro'].includes(t.id)
    ),
    recipientes: TUBE_TYPES.filter(t =>
      ['est', 'estl', 'est2', 'est3', 'his', 'lam'].includes(t.id)
    ),
    otros: TUBE_TYPES.filter(t => t.id === 'otro')
  };
}

export default TUBE_TYPES;

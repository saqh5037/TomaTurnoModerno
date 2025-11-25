/**
 * Tests Unitarios: labsisTubeMapping.js
 * Sistema TomaTurnoModerno - INER
 *
 * Tests para validar el mapeo bidireccional entre tubos LABSIS e INER
 */

import {
  LABSIS_TO_INER_MAPPING,
  labsisToIner,
  inerToLabsis,
  getMappingByLabsisId,
  getMappingByLabsisCode,
  getMappingByInerId,
  convertLabsisContainerToIner,
  convertLabsisStudiesToIner,
  groupStudiesByContainer,
  validateStudiesMapping
} from '../lib/labsisTubeMapping.js';

describe('labsisTubeMapping - Constantes', () => {
  test('LABSIS_TO_INER_MAPPING debe tener al menos 10 mapeos', () => {
    expect(LABSIS_TO_INER_MAPPING.length).toBeGreaterThanOrEqual(10);
  });

  test('cada mapeo debe tener campos requeridos', () => {
    LABSIS_TO_INER_MAPPING.forEach(mapping => {
      expect(mapping).toHaveProperty('labsisId');
      expect(mapping).toHaveProperty('inerId');
      expect(mapping.labsisId).toBeTruthy();
      expect(mapping.inerId).toBeTruthy();
    });
  });

  test('no debe haber IDs duplicados de LABSIS', () => {
    const labsisIds = LABSIS_TO_INER_MAPPING.map(m => m.labsisId);
    const uniqueIds = new Set(labsisIds);
    expect(uniqueIds.size).toBe(labsisIds.length);
  });
});

describe('labsisTubeMapping - labsisToIner', () => {
  test('debe mapear ID numérico de LABSIS a ID INER', () => {
    // Tubo Tapa Roja: LABSIS ID 1 → INER 'rojo'
    const result = labsisToIner(1);
    expect(result).toBe('rojo');
  });

  test('debe mapear código string de LABSIS a ID INER', () => {
    // Tubo Tapa Roja: LABSIS code 'TR' → INER 'rojo'
    const result = labsisToIner('TR');
    expect(result).toBe('rojo');
  });

  test('debe retornar null para ID no encontrado', () => {
    expect(labsisToIner(999999)).toBeNull();
  });

  test('debe retornar null para código no encontrado', () => {
    expect(labsisToIner('CODIGO_INEXISTENTE')).toBeNull();
  });

  test('debe manejar input inválido', () => {
    expect(labsisToIner(null)).toBeNull();
    expect(labsisToIner(undefined)).toBeNull();
    expect(labsisToIner({})).toBeNull();
  });
});

describe('labsisTubeMapping - inerToLabsis', () => {
  test('debe mapear ID INER a objeto LABSIS completo', () => {
    const result = inerToLabsis('rojo');

    expect(result).toHaveProperty('labsisId');
    expect(result).toHaveProperty('labsisCode');
    expect(result).toHaveProperty('labsisName');
    expect(result.labsisId).toBe(1);
    expect(result.labsisCode).toBe('TR');
  });

  test('debe retornar null para ID INER no encontrado', () => {
    expect(inerToLabsis('tubo_inexistente')).toBeNull();
  });

  test('debe manejar input inválido', () => {
    expect(inerToLabsis(null)).toBeNull();
    expect(inerToLabsis(undefined)).toBeNull();
  });
});

describe('labsisTubeMapping - getMappingByLabsisId', () => {
  test('debe retornar mapeo completo por ID de LABSIS', () => {
    const mapping = getMappingByLabsisId(1);

    expect(mapping).toBeTruthy();
    expect(mapping.labsisId).toBe(1);
    expect(mapping.inerId).toBe('rojo');
    expect(mapping).toHaveProperty('labsisCode');
    expect(mapping).toHaveProperty('labsisName');
  });

  test('debe retornar null si no existe', () => {
    expect(getMappingByLabsisId(999999)).toBeNull();
  });
});

describe('labsisTubeMapping - getMappingByLabsisCode', () => {
  test('debe retornar mapeo completo por código de LABSIS', () => {
    const mapping = getMappingByLabsisCode('TR');

    expect(mapping).toBeTruthy();
    expect(mapping.labsisCode).toBe('TR');
    expect(mapping.inerId).toBe('rojo');
  });

  test('debe ser case-insensitive', () => {
    const mapping1 = getMappingByLabsisCode('TR');
    const mapping2 = getMappingByLabsisCode('tr');

    expect(mapping1).toEqual(mapping2);
  });

  test('debe retornar null si no existe', () => {
    expect(getMappingByLabsisCode('CODIGO_FALSO')).toBeNull();
  });
});

describe('labsisTubeMapping - getMappingByInerId', () => {
  test('debe retornar mapeo completo por ID INER', () => {
    const mapping = getMappingByInerId('rojo');

    expect(mapping).toBeTruthy();
    expect(mapping.inerId).toBe('rojo');
    expect(mapping.labsisId).toBe(1);
  });

  test('debe retornar null si no existe', () => {
    expect(getMappingByInerId('tubo_falso')).toBeNull();
  });
});

describe('labsisTubeMapping - convertLabsisContainerToIner', () => {
  test('debe convertir contenedor de LABSIS usando ID numérico', () => {
    const labsisContainer = {
      id: 1,
      type: 'Tubo Tapa Roja',
      abbreviation: 'TR'
    };

    const result = convertLabsisContainerToIner(labsisContainer);

    // Retorna objeto completo del catálogo INER
    expect(result).toBeTruthy();
    expect(result.id).toBe('rojo');
    expect(result.color).toBe('Rojo');
    expect(result.labsisId).toBe(1);
  });

  test('debe convertir contenedor usando código string', () => {
    const labsisContainer = {
      id: 'TR',
      type: 'Tubo Tapa Roja'
    };

    const result = convertLabsisContainerToIner(labsisContainer);

    expect(result).toBeTruthy();
    expect(result.id).toBe('rojo');
  });

  test('debe intentar fuzzy matching si no encuentra mapeo directo', () => {
    const labsisContainer = {
      id: 999,  // ID que no existe
      type: 'Tubo Tapa Roja',  // Nombre que sí puede matchear
      abbreviation: 'TR'
    };

    const result = convertLabsisContainerToIner(labsisContainer);

    // Debería usar abbreviation como fallback
    expect(result).toBeTruthy();
    expect(result.id).toBe('rojo');
  });

  test('debe retornar null si no encuentra ningún mapeo', () => {
    const labsisContainer = {
      id: 999,
      type: 'Contenedor Inexistente ABC',
      abbreviation: 'XYZ'
    };

    const result = convertLabsisContainerToIner(labsisContainer);

    expect(result).toBeNull();
  });
});

describe('labsisTubeMapping - convertLabsisStudiesToIner', () => {
  test('debe convertir array de estudios de LABSIS', () => {
    const labsisStudies = [
      {
        name: 'Glucosa',
        container: {
          id: 1,
          type: 'Tubo Tapa Roja',
          abbreviation: 'TR'
        },
        sample: {
          id: 1,
          type: 'Suero'
        }
      }
    ];

    const result = convertLabsisStudiesToIner(labsisStudies);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Glucosa');
    expect(result[0].container.id).toBe('rojo');
  });

  test('debe manejar estudios sin contenedor', () => {
    const labsisStudies = [
      {
        name: 'Estudio Sin Container'
      }
    ];

    const result = convertLabsisStudiesToIner(labsisStudies);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Estudio Sin Container');
    expect(result[0].container).toBeNull();
  });

  test('debe marcar estudios con errores de mapeo', () => {
    const labsisStudies = [
      {
        name: 'Estudio Con Container Inexistente',
        container: {
          id: 999,
          type: 'Container No Mapeado XYZ',
          abbreviation: 'XYZ'
        }
      }
    ];

    const result = convertLabsisStudiesToIner(labsisStudies);

    expect(result).toHaveLength(1);
    // Cuando no se encuentra mapeo, el container no se convierte correctamente
    expect(result[0]._mappingError).toBe('NO_MAPPING_FOUND');
  });

  test('debe procesar múltiples estudios', () => {
    const labsisStudies = [
      {
        name: 'Glucosa',
        container: { id: 1, type: 'Tubo Tapa Roja', abbreviation: 'TR' }
      },
      {
        name: 'Hemograma',
        container: { id: 2, type: 'Tubo Tapa Lila', abbreviation: 'TL' }
      }
    ];

    const result = convertLabsisStudiesToIner(labsisStudies);

    expect(result).toHaveLength(2);
    expect(result[0].container.id).toBe('rojo');
    expect(result[1].container.id).toBe('mor'); // ID 2 en LABSIS = 'mor' en INER
  });
});

describe('labsisTubeMapping - groupStudiesByContainer', () => {
  test('debe agrupar estudios por container.id', () => {
    const studies = [
      {
        name: 'Glucosa',
        container: { id: 'rojo', type: 'Tubo Tapa Roja' }
      },
      {
        name: 'Colesterol',
        container: { id: 'rojo', type: 'Tubo Tapa Roja' }
      },
      {
        name: 'Hemograma',
        container: { id: 'mor', type: 'Tubo Tapa Lila' }
      }
    ];

    const result = groupStudiesByContainer(studies);

    expect(result).toHaveLength(2);

    const redTube = result.find(t => t.type === 'rojo');
    expect(redTube.quantity).toBe(2);

    const purpleTube = result.find(t => t.type === 'mor');
    expect(purpleTube.quantity).toBe(1);
  });

  test('debe ignorar estudios sin contenedor válido', () => {
    const studies = [
      {
        name: 'Estudio Sin Container'
      },
      {
        name: 'Estudio Con Container',
        container: { id: 'rojo', type: 'Tubo Tapa Roja' }
      }
    ];

    const result = groupStudiesByContainer(studies);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('rojo');
  });

  test('debe retornar array vacío si no hay estudios válidos', () => {
    const studies = [
      { name: 'Estudio 1' },
      { name: 'Estudio 2' }
    ];

    const result = groupStudiesByContainer(studies);

    expect(result).toEqual([]);
  });
});

describe('labsisTubeMapping - validateStudiesMapping', () => {
  test('debe validar estudios correctamente mapeados', () => {
    const studies = [
      {
        name: 'Glucosa',
        container: { id: 'rojo', type: 'Tubo Tapa Roja' }
      }
    ];

    const result = validateStudiesMapping(studies);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('debe detectar estudios sin contenedor', () => {
    const studies = [
      {
        name: 'Estudio Sin Container'
      }
    ];

    const result = validateStudiesMapping(studies);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('no tiene contenedor');
  });

  test('debe detectar errores de mapeo', () => {
    const studies = [
      {
        name: 'Estudio Con Error',
        container: { id: 'rojo', type: 'Tubo Tapa Roja' },
        _mappingError: 'NO_MAPPING_FOUND'
      }
    ];

    const result = validateStudiesMapping(studies);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('NO_MAPPING_FOUND');
  });

  test('debe validar múltiples estudios', () => {
    const studies = [
      {
        name: 'Estudio OK',
        container: { id: 'rojo', type: 'Tubo Tapa Roja' }
      },
      {
        name: 'Estudio Sin Container'
      },
      {
        name: 'Estudio Con Error',
        container: { id: 'mor', type: 'Tubo Tapa Lila' },
        _mappingError: 'TEST_ERROR'
      }
    ];

    const result = validateStudiesMapping(studies);

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });

  test('debe retornar advertencias si existen', () => {
    const studies = [
      {
        name: 'Estudio 1',
        container: { id: 'rojo', type: 'Tubo Tapa Roja' }
      }
    ];

    const result = validateStudiesMapping(studies);

    // No debería tener warnings en estudios normales
    expect(result.warnings).toBeDefined();
    expect(Array.isArray(result.warnings)).toBe(true);
  });
});

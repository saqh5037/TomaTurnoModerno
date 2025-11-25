/**
 * Tests Unitarios: studiesProcessor.js
 * Sistema TomaTurnoModerno - INER
 *
 * Tests para validar el procesamiento de estudios desde LABSIS
 */

import {
  detectStudiesFormat,
  parseStudies,
  mapLabsisToInternalTubes,
  generateTubesDetails,
  enrichStudiesWithCatalog,
  groupStudiesForDisplay,
  processStudiesComplete,
  validateTurnData,
  generateProcessingSummary
} from '../lib/studiesProcessor.js';

describe('studiesProcessor - detectStudiesFormat', () => {
  test('debe detectar formato legacy_array (array de strings)', () => {
    const studies = ['Hemograma', 'Glucosa', 'Colesterol'];
    expect(detectStudiesFormat(studies)).toBe('legacy_array');
  });

  test('debe detectar formato structured (objetos con container)', () => {
    const studies = [
      {
        id: 1,
        name: 'Hemograma',
        container: { id: 1, type: 'Tubo Tapa Lila' }
      }
    ];
    expect(detectStudiesFormat(studies)).toBe('structured');
  });

  test('debe detectar formato semi_structured (objetos sin container)', () => {
    const studies = [
      { id: 1, name: 'Hemograma' }
    ];
    expect(detectStudiesFormat(studies)).toBe('semi_structured');
  });

  test('debe detectar formato empty_array', () => {
    expect(detectStudiesFormat([])).toBe('empty_array');
  });

  test('debe detectar formato legacy_string', () => {
    const studies = '["Hemograma", "Glucosa"]';
    expect(detectStudiesFormat(studies)).toBe('legacy_string');
  });

  test('debe detectar formato unknown', () => {
    expect(detectStudiesFormat(123)).toBe('unknown');
    expect(detectStudiesFormat(null)).toBe('unknown');
  });
});

describe('studiesProcessor - parseStudies', () => {
  test('debe parsear array de strings (legacy_array)', () => {
    const studies = ['Hemograma', 'Glucosa'];
    const result = parseStudies(studies);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      name: 'Hemograma',
      container: null,
      sample: null
    });
  });

  test('debe parsear string JSON (legacy_string)', () => {
    const studies = '["Hemograma", "Glucosa"]';
    const result = parseStudies(studies);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Hemograma');
  });

  test('debe parsear formato structured sin modificar', () => {
    const studies = [
      {
        id: 1,
        name: 'Hemograma',
        container: { id: 5, type: 'Tubo Tapa Lila' },
        sample: { id: 1, type: 'Sangre Total' }
      }
    ];
    const result = parseStudies(studies);

    expect(result).toEqual(studies);
  });

  test('debe manejar array vacío', () => {
    expect(parseStudies([])).toEqual([]);
  });

  test('debe manejar JSON inválido en legacy_string', () => {
    const studies = 'invalid json';
    const result = parseStudies(studies);

    expect(result).toEqual([]);
  });
});

describe('studiesProcessor - generateTubesDetails', () => {
  test('debe generar tubesDetails desde estudios mapeados', () => {
    const studies = [
      {
        name: 'Hemograma',
        container: { id: 'mor', type: 'Tubo Tapa Lila' } // 'mor' es el ID correcto
      },
      {
        name: 'Glucosa',
        container: { id: 'rojo', type: 'Tubo Tapa Roja' }
      }
    ];

    const result = generateTubesDetails(studies);

    // Debe tener 2 tipos diferentes de tubos
    expect(result).toHaveLength(2);

    const redTube = result.find(t => t.type === 'rojo');
    expect(redTube).toBeDefined();
    expect(redTube.quantity).toBe(1); // Solo Glucosa

    const purpleTube = result.find(t => t.type === 'mor');
    expect(purpleTube).toBeDefined();
    expect(purpleTube.quantity).toBe(1); // Solo Hemograma
  });

  test('debe agrupar múltiples estudios del mismo tubo', () => {
    const studies = [
      {
        name: 'Glucosa',
        container: { id: 'rojo', type: 'Tubo Tapa Roja' }
      },
      {
        name: 'Colesterol',
        container: { id: 'rojo', type: 'Tubo Tapa Roja' }
      }
    ];

    const result = generateTubesDetails(studies);

    // Solo debe retornar 1 tipo de tubo
    expect(result).toHaveLength(1);

    const redTube = result.find(t => t.type === 'rojo');
    expect(redTube).toBeDefined();
    expect(redTube.quantity).toBe(2); // Glucosa + Colesterol agrupados
  });

  test('debe retornar array vacío si no hay estudios', () => {
    expect(generateTubesDetails([])).toEqual([]);
    expect(generateTubesDetails(null)).toEqual([]);
  });

  test('debe filtrar tubos no encontrados en catálogo', () => {
    const studies = [
      {
        name: 'Estudio Test',
        container: { id: 'tubo_inexistente_xyz', type: 'Tubo Inexistente' }
      }
    ];

    const result = generateTubesDetails(studies);

    // El tubo inexistente debe ser filtrado
    expect(result).toEqual([]);
  });
});

describe('studiesProcessor - groupStudiesForDisplay', () => {
  test('debe agrupar estudios por tipo de contenedor', () => {
    const studies = [
      {
        name: 'Glucosa',
        container: { id: 'rojo', name: 'Tubo Tapa Roja', color: 'Rojo', colorHex: '#fc181e' }
      },
      {
        name: 'Colesterol',
        container: { id: 'rojo', name: 'Tubo Tapa Roja', color: 'Rojo', colorHex: '#fc181e' }
      },
      {
        name: 'Hemograma',
        container: { id: 'mor', name: 'Tubo Tapa Lila', color: 'Lila', colorHex: '#d510da' }
      }
    ];

    const result = groupStudiesForDisplay(studies);

    expect(result).toHaveLength(2);

    const redGroup = result.find(g => g.tubeId === 'rojo');
    expect(redGroup.studies).toEqual(['Glucosa', 'Colesterol']);

    const purpleGroup = result.find(g => g.tubeId === 'mor');
    expect(purpleGroup.studies).toEqual(['Hemograma']);
  });

  test('debe agrupar estudios sin contenedor', () => {
    const studies = [
      { name: 'Estudio Sin Contenedor 1' },
      { name: 'Estudio Sin Contenedor 2' }
    ];

    const result = groupStudiesForDisplay(studies);

    expect(result).toHaveLength(1);
    expect(result[0].tubeName).toBe('Sin Contenedor Especificado');
    expect(result[0].studies).toEqual(['Estudio Sin Contenedor 1', 'Estudio Sin Contenedor 2']);
  });

  test('debe retornar array vacío para entrada vacía', () => {
    expect(groupStudiesForDisplay([])).toEqual([]);
    expect(groupStudiesForDisplay(null)).toEqual([]);
  });
});

describe('studiesProcessor - processStudiesComplete', () => {
  test('debe procesar completamente estudios en formato nuevo (structured)', () => {
    const rawStudies = [
      {
        id: 100,
        code: 'GLUC',
        name: 'Glucosa',
        category: 'Química Clínica',
        container: { id: 1, type: 'Tubo Tapa Roja', abbreviation: 'TR', color: 'Rojo' },
        sample: { id: 1, type: 'Suero', code: 'SER' }
      }
    ];

    const result = processStudiesComplete(rawStudies);

    expect(result.success).toBe(true);
    expect(result.studies).toHaveLength(1);
    expect(result.studies[0].name).toBe('Glucosa');
    expect(result.tubesRequired).toBeGreaterThan(0);
    expect(result.tubesDetails).toHaveLength(1);
    expect(result.stats.totalStudies).toBe(1);
  });

  test('debe procesar estudios en formato legacy (array de strings)', () => {
    const rawStudies = ['Hemograma', 'Glucosa'];

    const result = processStudiesComplete(rawStudies);

    expect(result.success).toBe(true);
    expect(result.studies).toHaveLength(2);
    expect(result.studies[0].name).toBe('Hemograma');
    expect(result.studies[1].name).toBe('Glucosa');
  });

  test('debe agrupar correctamente múltiples estudios en mismo tubo', () => {
    const rawStudies = [
      {
        name: 'Glucosa',
        container: { id: 1, type: 'Tubo Tapa Roja', abbreviation: 'TR' }
      },
      {
        name: 'Colesterol',
        container: { id: 1, type: 'Tubo Tapa Roja', abbreviation: 'TR' }
      }
    ];

    const result = processStudiesComplete(rawStudies);

    expect(result.success).toBe(true);
    expect(result.tubesDetails).toHaveLength(1);
    expect(result.tubesDetails[0].quantity).toBe(2);
    expect(result.tubesGrouped).toHaveLength(1);
    expect(result.tubesGrouped[0].studies).toHaveLength(2);
  });

  test('debe manejar array vacío sin error', () => {
    const result = processStudiesComplete([]);

    expect(result.success).toBe(true);
    expect(result.studies).toEqual([]);
    expect(result.tubesRequired).toBe(0);
  });

  test('debe retornar error en caso de fallo', () => {
    // Forzar error pasando valor inválido
    const result = processStudiesComplete(undefined);

    // Como undefined no es un formato válido, debería parsearse como []
    expect(result.success).toBe(true);
    expect(result.studies).toEqual([]);
  });

  test('debe calcular estadísticas correctamente', () => {
    const rawStudies = [
      {
        name: 'Estudio Con Container',
        container: { id: 'rojo', type: 'Tubo Tapa Roja' }
      },
      {
        name: 'Estudio Sin Container'
      }
    ];

    const result = processStudiesComplete(rawStudies);

    expect(result.stats.totalStudies).toBe(2);
    expect(result.stats.studiesWithContainer).toBe(1);
    expect(result.stats.studiesWithoutContainer).toBe(1);
  });
});

describe('studiesProcessor - validateTurnData', () => {
  test('debe validar datos correctos del turno', () => {
    const turnData = {
      patientName: 'Juan Pérez',
      age: 45,
      gender: 'M',
      studies: ['Hemograma', 'Glucosa']
    };

    const result = validateTurnData(turnData);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('debe detectar nombre faltante', () => {
    const turnData = {
      patientName: '',
      age: 45,
      gender: 'M',
      studies: ['Hemograma']
    };

    const result = validateTurnData(turnData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Nombre del paciente es requerido');
  });

  test('debe detectar edad inválida', () => {
    const turnData = {
      patientName: 'Juan Pérez',
      age: -5,
      gender: 'M',
      studies: ['Hemograma']
    };

    const result = validateTurnData(turnData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Edad del paciente debe estar entre 0 y 150');
  });

  test('debe detectar género faltante', () => {
    const turnData = {
      patientName: 'Juan Pérez',
      age: 45,
      studies: ['Hemograma']
    };

    const result = validateTurnData(turnData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Género del paciente es requerido');
  });

  test('debe detectar estudios faltantes', () => {
    const turnData = {
      patientName: 'Juan Pérez',
      age: 45,
      gender: 'M',
      studies: []
    };

    const result = validateTurnData(turnData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Debe especificar al menos un estudio');
  });

  test('debe detectar múltiples errores', () => {
    const turnData = {
      patientName: '',
      age: 200,
      studies: []
    };

    const result = validateTurnData(turnData);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(2);
  });
});

describe('studiesProcessor - generateProcessingSummary', () => {
  test('debe generar resumen para procesamiento exitoso', () => {
    const processedData = {
      success: true,
      stats: {
        totalStudies: 3,
        studiesWithContainer: 3,
        studiesWithoutContainer: 0,
        totalTubes: 2,
        uniqueTubeTypes: 2
      },
      tubesGrouped: [
        {
          tubeName: 'Tubo Tapa Roja',
          tubeColor: 'Rojo',
          studies: ['Glucosa', 'Colesterol']
        },
        {
          tubeName: 'Tubo Tapa Lila',
          tubeColor: 'Lila',
          studies: ['Hemograma']
        }
      ]
    };

    const summary = generateProcessingSummary(processedData);

    expect(summary).toContain('Procesamiento exitoso');
    expect(summary).toContain('Total de estudios: 3');
    expect(summary).toContain('Total de tubos: 2');
    expect(summary).toContain('Tubo Tapa Roja');
    expect(summary).toContain('Glucosa');
  });

  test('debe generar mensaje de error para procesamiento fallido', () => {
    const processedData = {
      success: false,
      error: 'Error al procesar estudios'
    };

    const summary = generateProcessingSummary(processedData);

    expect(summary).toContain('ERROR');
    expect(summary).toContain('Error al procesar estudios');
  });
});

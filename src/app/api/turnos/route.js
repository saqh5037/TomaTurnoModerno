/**
 * API Endpoint: /api/turnos
 * Sistema TomaTurnoModerno - INER
 *
 * Endpoint de compatibilidad para recibir datos desde LABSIS
 * Mapea códigos de contenedores de LABSIS a IDs del catálogo INER
 * y reenvía la solicitud transformada al endpoint /api/turns/create
 *
 * v2.1 - Composite mapping: containerCode + sampleType
 */

import { NextResponse } from 'next/server';
import { labsisToIner } from '@/lib/labsisTubeMapping';

/**
 * Mapeo COMPUESTO containerCode + sampleType → INER tube ID
 *
 * LABSIS usa el mismo containerCode para diferentes tubos según el tipo de muestra.
 * Por ejemplo: "MORQ" puede ser Tubo Amarillo (para Suero) o Tubo Lila Q (para Plasma)
 *
 * Formato de clave: "containerCode+sampleType"
 */
const LABSIS_CONTAINER_SAMPLE_TO_INER = {
  // MORQ - Código compartido entre Tubo Amarillo y Tubo Lila Q
  'MORQ+Suero': 'morq',      // ID 3: TUBO TAPA AMARILLA → Tubo Amarillo INER
  'MORQ+Plasma': 'mor',      // ID 15: TUBO TAPA LILA Q → Tubo Lila INER

  // MOR - Tubo Tapa Lila
  'MOR+SangreT': 'mor',      // ID 2: TUBO TAPA LILA → Tubo Lila INER
  'MOR+Celulas': 'mor',      // Células también van en tubo lila

  // ROJO - Tubo Tapa Roja
  'ROJO+Suero': 'rojo',      // ID 1: TUBO TAPA ROJA → Tubo Rojo INER

  // VERD - Tubo Tapa Verde
  'VERD+Plasma': 'verd',     // ID 7: TUBO TAPA VERDE → Tubo Verde INER

  // AZUL - Tubo Tapa Azul
  'AZUL+Plasma': 'azul',     // ID 8: TUBO TAPA AZUL → Tubo Azul INER

  // GARR - Recolección Orina
  'GARR+Orina': 'garr',      // ID 10: RECOLECCIÓN ORINA → Recipiente Orina INER

  // EST - Recipiente Estéril
  'EST+Heces': 'est',        // ID 5: RECIPIENTE ESTERIL → Recipiente Estéril INER
  'EST+Semen': 'est',
  'EST+Otro': 'est',

  // ESTL - Estéril Líquidos
  'ESTL+LCR': 'estl',        // ID 6: ESTERIL LIQUIDOS → Recipiente Líquidos INER
  'ESTL+LIQ': 'estl',

  // HIS - Hisopo
  'HIS+Moco': 'his',         // ID 9: HISOPO → Hisopo INER

  // Otros recipientes
  'EST2+Saliva': 'est2',     // ID 13: RECIPIENTE ESTERIL 2
  'EST3+Sudor': 'est3',      // ID 14: RECIPIENTE ESTERIL 3
  'ORI+Orina': 'ori',        // ID 4: TUBO CONICO
  'EGO+Orina': 'ego',        // ID 16: TUBO CONICO (EGO)
};

/**
 * Mapeo LEGACY de tipos de muestra LABSIS → IDs catálogo INER
 *
 * DEPRECADO: Este mapeo se mantiene solo para compatibilidad con formato antiguo
 * El nuevo formato usa containerCode + sampleType
 *
 * @deprecated Usar containerCode + sampleType en lugar de type solo
 */
const LABSIS_SAMPLE_TYPE_TO_INER_TUBE = {
  // Muestras de sangre
  'SangreT': 'mor',      // Sangre Total → Tubo Tapa Lila (EDTA) para biometría
  'Plasma': 'verd',      // Plasma → Tubo Tapa Verde (Heparina) para química en plasma
  'Suero': 'rojo',       // Suero → Tubo Tapa Roja para química clínica y serología

  // Otras muestras biológicas
  'Orina': 'garr',       // Orina → Recipiente para Recolección de Orina
  'Heces': 'est',        // Heces → Recipiente Estéril
  'LCR': 'estl',         // Líquido Cefalorraquídeo → Recipiente Estéril Líquidos
  'Saliva': 'est2',      // Saliva → Recipiente Estéril 2
  'Sudor': 'est3',       // Sudor → Recipiente Estéril 3
  'Moco': 'his',         // Moco → Hisopo
  'Semen': 'est',        // Semen → Recipiente Estéril
  'LIQ': 'estl',         // Líquido (genérico) → Recipiente Estéril Líquidos
  'Celulas': 'mor',      // Células → Tubo Tapa Lila (EDTA)
  'Otro': 'otro',        // Otro → Otro tipo de contenedor
};

/**
 * Transformar tubesDetails de LABSIS a formato INER
 *
 * FORMATO NUEVO (preferido):
 * LABSIS envía: [{ containerCode: "MORQ", sampleType: "Suero", quantity: 2 }]
 * INER espera:  [{ type: "morq", quantity: 2 }]
 *
 * FORMATO LEGACY (compatible):
 * LABSIS envía: [{ type: "Suero", quantity: 2 }]
 * INER espera:  [{ type: "rojo", quantity: 2 }]
 *
 * @param {Array} labsisTubesDetails - Array con tipos de LABSIS
 * @returns {Object} { success: boolean, tubesDetails: Array, errors: Array, warnings: Array, format: string }
 */
function transformTubesDetails(labsisTubesDetails) {
  if (!Array.isArray(labsisTubesDetails)) {
    return {
      success: false,
      tubesDetails: [],
      errors: ['tubesDetails debe ser un array'],
      warnings: [],
      format: 'invalid'
    };
  }

  const transformedTubes = [];
  const errors = [];
  const warnings = [];
  let detectedFormat = 'unknown';

  labsisTubesDetails.forEach((tube, index) => {
    let inerTubeId = null;

    // Validar quantity primero (común a ambos formatos)
    if (typeof tube.quantity !== 'number' || tube.quantity <= 0) {
      errors.push(`Tubo ${index + 1}: quantity debe ser un número positivo`);
      return;
    }

    // FORMATO NUEVO: { containerCode, sampleType, quantity }
    if (tube.containerCode) {
      detectedFormat = 'new';

      // PASO 1: Intentar mapeo COMPUESTO (containerCode + sampleType)
      if (tube.sampleType) {
        const compositeKey = `${tube.containerCode}+${tube.sampleType}`;
        inerTubeId = LABSIS_CONTAINER_SAMPLE_TO_INER[compositeKey];

        if (inerTubeId) {
          console.log(`[transformTubesDetails] Tubo ${index + 1}: ${tube.containerCode} + ${tube.sampleType} → ${inerTubeId} (mapeo compuesto)`);
        } else {
          warnings.push(`Tubo ${index + 1}: combinación "${compositeKey}" no encontrada en mapeo compuesto`);
        }
      }

      // PASO 2: Si no hay match compuesto, intentar solo containerCode (fallback)
      if (!inerTubeId) {
        inerTubeId = labsisToIner(tube.containerCode);

        if (inerTubeId) {
          console.log(`[transformTubesDetails] Tubo ${index + 1}: ${tube.containerCode} → ${inerTubeId} (fallback containerCode solo)`);
          warnings.push(`Tubo ${index + 1}: usando fallback containerCode solo (falta sampleType o combinación no mapeada)`);
        }
      }

      // PASO 3: Si aún no hay match, error
      if (!inerTubeId) {
        errors.push(`Tubo ${index + 1}: containerCode "${tube.containerCode}" no encontrado en ningún mapeo`);
        return;
      }
    }
    // FORMATO LEGACY: { type, quantity }
    else if (tube.type) {
      detectedFormat = detectedFormat === 'new' ? 'mixed' : 'legacy';

      // Intentar mapeo legacy por tipo de muestra
      inerTubeId = LABSIS_SAMPLE_TYPE_TO_INER_TUBE[tube.type];

      if (!inerTubeId) {
        warnings.push(`Tubo ${index + 1}: tipo legacy "${tube.type}" no encontrado - usando como ID directo`);
        inerTubeId = tube.type; // Asumir que ya es un ID de INER
      } else {
        warnings.push(`Tubo ${index + 1}: usando mapeo legacy para tipo "${tube.type}"`);
      }
    }
    // ERROR: Falta containerCode o type
    else {
      errors.push(`Tubo ${index + 1}: falta campo 'containerCode' (nuevo formato) o 'type' (formato legacy)`);
      return;
    }

    // Agregar tubo transformado con sampleType para diferenciación
    transformedTubes.push({
      type: inerTubeId,
      quantity: tube.quantity,
      sampleType: tube.sampleType || null  // Preservar sampleType original de LABSIS
    });
  });

  // Warning si se detecta formato legacy
  if (detectedFormat === 'legacy') {
    warnings.push('AVISO: Formato legacy detectado. Considere actualizar a nuevo formato con containerCode y sampleType.');
  } else if (detectedFormat === 'mixed') {
    warnings.push('AVISO: Formato mixto detectado (nuevo y legacy). Estandarizar al nuevo formato.');
  }

  return {
    success: errors.length === 0,
    tubesDetails: transformedTubes,
    errors,
    warnings,
    format: detectedFormat
  };
}

/**
 * POST /api/turnos
 * Endpoint de compatibilidad para LABSIS
 */
export async function POST(request) {
  try {
    // 1. Parsear body de la solicitud
    const labsisData = await request.json();

    console.log('[/api/turnos] Solicitud recibida de LABSIS:', {
      patientName: labsisData.patientName,
      tubesDetails: labsisData.tubesDetails
    });

    // 2. Validar campos requeridos
    if (!labsisData.patientName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Falta campo requerido: patientName'
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(labsisData.studies) || labsisData.studies.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Falta campo requerido: studies (array con al menos 1 estudio)'
        },
        { status: 400 }
      );
    }

    // 3. Transformar tubesDetails de LABSIS a INER
    const tubesTransformation = transformTubesDetails(labsisData.tubesDetails || []);

    // Log de transformación (sin consolidación - mantener datos exactos de LABSIS)
    if (tubesTransformation.success && tubesTransformation.tubesDetails.length > 0) {
      console.log('[/api/turnos] Tubos transformados (sin consolidación):', {
        original: labsisData.tubesDetails,
        transformed: tubesTransformation.tubesDetails
      });
    }

    if (!tubesTransformation.success) {
      console.error('[/api/turnos] Error en transformación de tubos:', tubesTransformation.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Error en transformación de tubos',
          details: tubesTransformation.errors
        },
        { status: 400 }
      );
    }

    // Mostrar warnings si los hay
    if (tubesTransformation.warnings.length > 0) {
      console.warn('[/api/turnos] Warnings en transformación:', tubesTransformation.warnings);
    }

    // 4. Construir request transformado para /api/turns/create
    const transformedData = {
      ...labsisData,
      tubesDetails: tubesTransformation.tubesDetails
    };

    console.log('[/api/turnos] Datos transformados:', {
      patientName: transformedData.patientName,
      originalTubes: labsisData.tubesDetails,
      transformedTubes: transformedData.tubesDetails
    });

    // 5. Reenviar solicitud a /api/turns/create
    const baseUrl = request.headers.get('host') || 'localhost:3006';
    const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
    const createTurnUrl = `${protocol}://${baseUrl}/api/turns/create`;

    console.log('[/api/turnos] Reenviando a:', createTurnUrl);

    const response = await fetch(createTurnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData)
    });

    const responseData = await response.json();

    // 6. Retornar respuesta de /api/turns/create a LABSIS
    if (!response.ok) {
      console.error('[/api/turnos] Error de /api/turns/create:', responseData);
      return NextResponse.json(
        {
          success: false,
          error: responseData.error || 'Error al crear turno',
          details: responseData.details || responseData.message,
          _source: 'INER_CREATE_ENDPOINT'
        },
        { status: response.status }
      );
    }

    console.log('[/api/turnos] Turno creado exitosamente:', {
      responseData
    });

    return NextResponse.json({
      success: true,
      message: 'Turno creado exitosamente desde LABSIS',
      ...responseData,
      _labsisTransformation: {
        warnings: tubesTransformation.warnings,
        originalTubesDetails: labsisData.tubesDetails,
        transformedTubesDetails: tubesTransformation.tubesDetails
      }
    });

  } catch (error) {
    console.error('[/api/turnos] Error en endpoint:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: error.message,
        _endpoint: '/api/turnos'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/turnos
 * Retornar información sobre el endpoint y el mapeo disponible
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/turnos',
    description: 'Endpoint de compatibilidad para LABSIS - Mapea códigos de contenedores a catálogo INER',
    version: '2.0.0',
    formats: {
      new: {
        description: 'Formato actual con containerCode y sampleType',
        example: {
          patientName: 'MARIA DEL ROCIO ARENAS LARA',
          age: 52,
          gender: 'F',
          contactInfo: '5512345678',
          studies: ['VITAMINA D', 'BIOMETRIA HEMATICA'],
          tubesDetails: [
            {
              containerCode: 'MORQ',
              sampleType: 'Suero',
              quantity: 2
            },
            {
              containerCode: 'MOR',
              sampleType: 'SangreT',
              quantity: 1
            }
          ],
          observations: '',
          clinicalInfo: 'EPI NO ESPECIFICADA',
          tipoAtencion: 'General'
        },
        fields: {
          containerCode: 'Código de abreviación del contenedor de LABSIS (ej: ROJO, MOR, MORQ, GARR)',
          sampleType: 'Tipo de muestra biológica (ej: Suero, SangreT, Orina)',
          quantity: 'Cantidad de tubos de este tipo'
        }
      },
      legacy: {
        description: 'Formato antiguo (DEPRECADO) - mantener solo por compatibilidad',
        example: {
          tubesDetails: [
            { type: 'Suero', quantity: 2 },
            { type: 'SangreT', quantity: 1 }
          ]
        },
        status: 'DEPRECADO - Migrar al nuevo formato'
      }
    },
    usage: {
      method: 'POST',
      requiredFields: ['patientName', 'age', 'gender', 'studies'],
      optionalFields: ['contactInfo', 'tubesDetails', 'observations', 'clinicalInfo', 'tipoAtencion'],
      tubesDetailsRequired: ['containerCode', 'sampleType', 'quantity']
    },
    containerCodes: {
      common: ['ROJO', 'MOR', 'MORQ', 'VERD', 'AZUL', 'GARR', 'EST', 'ESTL'],
      description: 'Códigos comunes de contenedores. Ver /lib/labsisTubeMapping.js para lista completa.'
    },
    notes: [
      'Usar containerCode (abreviación de tipo_contenedor de LABSIS)',
      'Los códigos se mapean automáticamente a IDs del catálogo INER',
      'Los tubos se mantienen exactamente como LABSIS los envía (sin consolidación)',
      'Si tubesDetails está vacío, se generará automáticamente desde studies',
      'La solicitud se reenvía a /api/turns/create después de la transformación'
    ]
  });
}

import { TIPOS_ATENCION } from './prioridadUtils.js';

/**
 * Mapeo de códigos crudos LABSIS → tipoAtencion canónico.
 *
 * Strings exactos del campo `codigo` (varchar(30)) de la tabla `departamentos`
 * en LABSIS. Confirmado con screenshot 2026-04-07.
 *
 * Cómo extender: si Sinivaldo agrega un nuevo departamento en LABSIS,
 * agregar una entrada nueva a este array. No requiere tocar lógica.
 */
export const LABSIS_CODIGO_TO_TIPO = [
  // id 1 — General (sin condición especial)
  { dptoId: 1,  codigoLabsis: 'NO',                       tipoAtencion: TIPOS_ATENCION.GENERAL },

  // ids 2,3,8,10,13 — Prioritario (todos cubículos, salta fila)
  { dptoId: 2,  codigoLabsis: 'Oxígeno Dependientes',     tipoAtencion: TIPOS_ATENCION.PRIORITARIO },
  { dptoId: 3,  codigoLabsis: 'En Camilla',               tipoAtencion: TIPOS_ATENCION.PRIORITARIO },
  { dptoId: 8,  codigoLabsis: 'En ambulancia',            tipoAtencion: TIPOS_ATENCION.PRIORITARIO },
  { dptoId: 10, codigoLabsis: 'Menor de 1 Año',           tipoAtencion: TIPOS_ATENCION.PRIORITARIO },
  { dptoId: 13, codigoLabsis: 'Discapacidad psicosocial', tipoAtencion: TIPOS_ATENCION.PRIORITARIO },

  // id 12 — General (3ra edad NO es prioridad, confirmado con Samuel 2026-04-07)
  { dptoId: 12, codigoLabsis: '3ra Edad',                 tipoAtencion: TIPOS_ATENCION.GENERAL },

  // id 7 — MuyEspecial (solo cubículo 6)
  { dptoId: 7,  codigoLabsis: 'PPL',                      tipoAtencion: TIPOS_ATENCION.MUY_ESPECIAL },

  // id 9 — RiesgoCaida (solo cub 1-2, NO salta fila). OJO: BD tiene "caida" sin acento.
  { dptoId: 9,  codigoLabsis: 'Riesgo de caida',          tipoAtencion: TIPOS_ATENCION.RIESGO_CAIDA },

  // id 14 — PrioritarioRiesgo (solo cub 1-2, salta fila)
  { dptoId: 14, codigoLabsis: 'PRIESGO',                  tipoAtencion: TIPOS_ATENCION.PRIORITARIO_RIESGO },
];

/**
 * Normaliza un string para comparación tolerante:
 * - strip diacritics ("caída" → "caida")
 * - uppercase
 * - trim + colapsa espacios múltiples
 */
function normalize(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Deriva el tipoAtencion canónico a partir del código crudo de LABSIS.
 *
 * Tolerante a case, acentos y espacios extras. Retorna null si el código
 * no se reconoce — el caller decide el fallback (usualmente 'General').
 *
 * Nunca lanza excepción. Mismo patrón que labsisTubeMapping.js: never block
 * turn creation for unknown codes.
 *
 * @param {string|null|undefined} codigoLabsis - Valor del campo codigoAtencion
 * @returns {string|null} - Uno de los TIPOS_ATENCION o null si no se reconoce
 */
export function tipoAtencionFromCodigo(codigoLabsis) {
  if (!codigoLabsis) return null;
  const target = normalize(codigoLabsis);
  const match = LABSIS_CODIGO_TO_TIPO.find(m => normalize(m.codigoLabsis) === target);
  if (!match) {
    console.warn(`[codigoAtencion] Código LABSIS desconocido: "${codigoLabsis}" → fallback a General`);
    return null;
  }
  return match.tipoAtencion;
}

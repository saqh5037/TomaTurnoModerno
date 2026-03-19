/**
 * Sistema de prioridades TomaTurno INER
 *
 * 4 grupos de prioridad:
 * 1. MuyEspecial — Presos → cubículo 6, prioridad máxima
 * 2. Prioritario — O2, camilla, <1 año, discapacidad psicosocial, ambulancia → inicio de fila
 * 3. PrioritarioRiesgo — Prioritario + riesgo de caída → inicio de fila + cubículos 1,2
 * 4. RiesgoCaida — Solo riesgo de caída → cubículos 1,2 SIN saltar fila
 * 5. General — Orden de llegada
 */

// Valores canónicos de tipoAtencion
export const TIPOS_ATENCION = {
  MUY_ESPECIAL: 'MuyEspecial',
  PRIORITARIO: 'Prioritario',
  PRIORITARIO_RIESGO: 'PrioritarioRiesgo',
  RIESGO_CAIDA: 'RiesgoCaida',
  GENERAL: 'General',
};

// Orden de prioridad en la cola (menor = más prioridad)
// RiesgoCaida tiene mismo nivel que General (no salta fila)
export const PRIORIDAD_ORDEN = {
  MuyEspecial: 0,
  Prioritario: 1,
  PrioritarioRiesgo: 1, // Mismo nivel que Prioritario en la cola
  RiesgoCaida: 2,       // NO salta fila, mismo nivel que General
  General: 2,
};

// Cubículos preferidos por tipo (null = cualquiera)
export const CUBICULOS_POR_TIPO = {
  MuyEspecial: [6],      // Solo cubículo 6 (por nombre, no por ID)
  PrioritarioRiesgo: [1, 2], // Cubículos 1 y 2 (por nombre)
  RiesgoCaida: [1, 2],       // Cubículos 1 y 2 (por nombre)
  Prioritario: null,          // Cualquier cubículo
  General: null,              // Cualquier cubículo
};

// Labels para UI
export const PRIORIDAD_LABELS = {
  MuyEspecial: 'Muy Especial',
  Prioritario: 'Prioritario',
  PrioritarioRiesgo: 'Prioritario + Riesgo',
  RiesgoCaida: 'Riesgo de Caída',
  General: 'General',
};

// Colores para badges
export const PRIORIDAD_COLORES = {
  MuyEspecial: 'red',
  Prioritario: 'orange',
  PrioritarioRiesgo: 'yellow',
  RiesgoCaida: 'blue',
  General: 'gray',
};

// SQL CASE para ordenar la cola (usado en raw queries)
export const SQL_PRIORIDAD_ORDER = `
  CASE
    WHEN "tipoAtencion" = 'MuyEspecial' THEN 0
    WHEN "tipoAtencion" IN ('Prioritario', 'PrioritarioRiesgo') THEN 1
    ELSE 2
  END
`;

/**
 * Determina si un tipo de atención salta la fila (va al inicio)
 */
export function saltaFila(tipoAtencion) {
  return ['MuyEspecial', 'Prioritario', 'PrioritarioRiesgo'].includes(tipoAtencion);
}

/**
 * Determina los nombres de cubículos preferidos para un tipo de atención
 * @returns {string[]|null} Array de nombres de cubículos o null para cualquiera
 */
export function cubiculosPreferidos(tipoAtencion) {
  return CUBICULOS_POR_TIPO[tipoAtencion] || null;
}

/**
 * Normaliza un valor de tipoAtencion a su forma canónica
 */
export function normalizarTipoAtencion(valor) {
  if (!valor) return 'General';
  const t = valor.toLowerCase();
  if (t === 'muyespecial') return 'MuyEspecial';
  if (t === 'prioritarioriesgo') return 'PrioritarioRiesgo';
  if (['prioritario', 'special', 'especial'].includes(t)) return 'Prioritario';
  if (['riesgocaida', 'riesgo'].includes(t)) return 'RiesgoCaida';
  return 'General';
}

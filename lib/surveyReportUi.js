/**
 * Pure helpers for the survey compliance report UI (no React, no I/O).
 */

export const MAX_RANGE_DAYS = 93;
const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const ROW_STATUS = Object.freeze({
  MET: 'met',
  REFUSED: 'refused',
  PENDING: 'pending',
  NONE: 'none'
});

// Label + Chakra colorScheme per status. Text is always shown next to the color.
export const ROW_STATUS_META = Object.freeze({
  [ROW_STATUS.MET]: { label: 'Cumplió', colorScheme: 'green' },
  [ROW_STATUS.REFUSED]: { label: 'Negativas', colorScheme: 'orange' },
  [ROW_STATUS.PENDING]: { label: 'Pendiente', colorScheme: 'blue' },
  [ROW_STATUS.NONE]: { label: 'Sin encuesta', colorScheme: 'gray' }
});

/** Real calendar date (rejects 2026-02-31). Returns UTC ms or null. */
export function parseDay(s) {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return null;
  const [y, m, d] = s.split('-').map(Number);
  const ms = Date.UTC(y, m - 1, d);
  const back = new Date(ms);
  return back.getUTCFullYear() === y && back.getUTCMonth() === m - 1 && back.getUTCDate() === d ? ms : null;
}

const formatDay = (ms) => new Date(ms).toISOString().slice(0, 10);

/**
 * Row status: a completed survey wins; otherwise an open (pending) assignment is the
 * actionable state; otherwise refusals; otherwise nothing usable (released / admin bypass only).
 */
export function classifyRow(row) {
  if (!row) return ROW_STATUS.NONE;
  if ((row.completed || 0) > 0) return ROW_STATUS.MET;
  if ((row.pending || 0) > 0) return ROW_STATUS.PENDING;
  if ((row.refused || 0) > 0) return ROW_STATUS.REFUSED;
  return ROW_STATUS.NONE;
}

/**
 * Compliance = phlebotomist-days with >= 1 completed survey / phlebotomist-days with any assignment.
 * Report rows only exist for days with at least one assignment, so the denominator is rows.length.
 * percent is null when there is nothing to measure.
 */
export function computeCompliance(rows = []) {
  const total = rows.length;
  const compliant = rows.filter((r) => (r.completed || 0) > 0).length;
  const percent = total === 0 ? null : Math.round((compliant / total) * 100);
  return { compliant, total, percent };
}

/** Validates a from/to range (YYYY-MM-DD). Returns a Spanish error message or null. */
export function validateRange(from, to) {
  const fromMs = parseDay(from);
  const toMs = parseDay(to);
  if (fromMs === null || toMs === null) return 'Selecciona fechas válidas.';
  if (fromMs > toMs) return 'La fecha inicial no puede ser posterior a la final.';
  if ((toMs - fromMs) / DAY_MS + 1 > MAX_RANGE_DAYS) {
    return `El rango máximo es de ${MAX_RANGE_DAYS} días.`;
  }
  return null;
}

/** Quick preset ranges relative to `today` (YYYY-MM-DD, already in the work time zone). */
export function presetRange(preset, today) {
  const todayMs = parseDay(today);
  if (todayMs === null) throw new Error('today must be YYYY-MM-DD');
  switch (preset) {
    case 'today':
      return { from: today, to: today };
    case 'last7':
      return { from: formatDay(todayMs - 6 * DAY_MS), to: today };
    case 'month':
      return { from: `${today.slice(0, 7)}-01`, to: today };
    default:
      throw new Error(`Unknown preset: ${preset}`);
  }
}

/** Returns the preset key matching the range, or null. */
export function matchPreset(from, to, today) {
  for (const key of ['today', 'last7', 'month']) {
    const r = presetRange(key, today);
    if (r.from === from && r.to === to) return key;
  }
  return null;
}

/** Display date: 2026-03-19 -> 19/03/2026 */
export function formatWorkDate(workDate) {
  if (parseDay(workDate) === null) return workDate || '';
  const [y, m, d] = workDate.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Validates the settings form (values may be strings from inputs).
 * Returns { error: string|null, payload } where payload is ready for POST /api/admin/survey-config.
 */
export function buildSettingsPayload(form) {
  const toNum = (v) => (String(v ?? '').trim() === '' ? NaN : Number(v));
  const windowMax = toNum(form?.windowMax);
  const maxRefusalsPerDay = toNum(form?.maxRefusalsPerDay);
  if (!Number.isInteger(windowMax) || windowMax < 1 || windowMax > 20) {
    return { error: 'La ventana debe ser un entero entre 1 y 20.', payload: null };
  }
  if (!Number.isInteger(maxRefusalsPerDay) || maxRefusalsPerDay < 0 || maxRefusalsPerDay > 10) {
    return { error: 'Las negativas máximas por día deben ser un entero entre 0 y 10.', payload: null };
  }
  const url = String(form?.url ?? '').trim();
  let httpsOk = false;
  try {
    httpsOk = new URL(url).protocol === 'https:';
  } catch {
    httpsOk = false;
  }
  if (!httpsOk) return { error: 'La URL debe ser válida y comenzar con https://.', payload: null };
  if (form?.mode !== 'iframe' && form?.mode !== 'qr') {
    return { error: 'Selecciona un modo de encuesta.', payload: null };
  }
  return {
    error: null,
    payload: { enabled: form.enabled === true, mode: form.mode, windowMax, maxRefusalsPerDay, url }
  };
}

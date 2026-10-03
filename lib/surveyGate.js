/**
 * Survey gate: pure logic (no prisma, no I/O).
 *
 * Each phlebotomist must get one satisfaction survey answered per work day.
 * A random-but-stable target K in [1..windowMax] is derived per (user, day);
 * the K-th call of the day is flagged. Refusals/releases keep re-flagging
 * subsequent calls until a survey is COMPLETED or the daily refusal cap is hit.
 */

export const SURVEY_TIME_ZONE = 'America/Mexico_City';

export const SURVEY_STATUS = Object.freeze({
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  REFUSED: 'REFUSED',
  RELEASED: 'RELEASED',
  ADMIN_BYPASS: 'ADMIN_BYPASS'
});

export const DEFAULT_SURVEY_CONFIG = Object.freeze({
  enabled: false,
  mode: 'iframe',
  windowMax: 5,
  maxRefusalsPerDay: 3,
  url: 'https://redcap-iner.com.mx/surveys/?s=KXTEHHDT8C'
});

const MODES = ['iframe', 'qr'];

/**
 * Merge a raw SystemState value (JSON string, object or null) with defaults.
 * Invalid fields fall back to defaults so a corrupted row never breaks calling.
 */
export function resolveSurveyConfig(raw) {
  let parsed = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }
  const src = parsed && typeof parsed === 'object' ? parsed : {};
  const d = DEFAULT_SURVEY_CONFIG;

  const windowMax = Number.isInteger(src.windowMax) && src.windowMax >= 1 && src.windowMax <= 20
    ? src.windowMax : d.windowMax;
  const maxRefusalsPerDay = Number.isInteger(src.maxRefusalsPerDay) && src.maxRefusalsPerDay >= 0 && src.maxRefusalsPerDay <= 10
    ? src.maxRefusalsPerDay : d.maxRefusalsPerDay;

  return {
    enabled: src.enabled === true,
    mode: MODES.includes(src.mode) ? src.mode : d.mode,
    windowMax,
    maxRefusalsPerDay,
    url: typeof src.url === 'string' && /^https:\/\//i.test(src.url) ? src.url : d.url
  };
}

/** Calendar day (YYYY-MM-DD) in America/Mexico_City for the given instant. */
export function workDateFor(date = new Date()) {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SURVEY_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

/**
 * [start, end) UTC instants covering the given America/Mexico_City work day.
 * Uses the real zone offset (handles DST if it ever returns).
 */
export function workDateBounds(workDate) {
  const [y, m, d] = workDate.split('-').map(Number);
  const offsetMs = (utcGuess) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: SURVEY_TIME_ZONE,
      hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).formatToParts(new Date(utcGuess)).reduce((acc, p) => {
      acc[p.type] = Number(p.value);
      return acc;
    }, {});
    const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    return asUtc - Math.floor(utcGuess / 1000) * 1000;
  };
  const localMidnight = (day) => {
    const guess = Date.UTC(y, m - 1, day);
    return new Date(guess - offsetMs(guess));
  };
  return { start: localMidnight(d), end: localMidnight(d + 1) };
}

/**
 * Stable target K in [1..windowMax] for (userId, workDate).
 * Derived from an FNV-1a hash, so it needs no storage and is identical across
 * requests/instances. Changing windowMax mid-day changes K (accepted).
 */
export function targetIndexFor(userId, workDate, windowMax) {
  const max = Number.isInteger(windowMax) && windowMax >= 1 ? windowMax : DEFAULT_SURVEY_CONFIG.windowMax;
  const input = `${userId}|${workDate}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return (hash % max) + 1;
}

/**
 * Decide whether the call being made right now must carry a survey.
 *
 * @param {object} p
 * @param {object} p.config - resolved survey config
 * @param {number} p.callsToday - turns this user called today, INCLUDING the current one
 * @param {Array<{status:string}>} p.assignmentsToday - the user's assignments for workDate (excluding the current turn)
 * @param {number} p.userId
 * @param {string} p.workDate - YYYY-MM-DD
 * @returns {{flag: boolean, reason: string}}
 */
export function shouldFlagTurn({ config, callsToday, assignmentsToday = [], userId, workDate }) {
  if (!config || config.enabled !== true) return { flag: false, reason: 'disabled' };

  const has = (status) => assignmentsToday.some((a) => a.status === status);
  if (has(SURVEY_STATUS.COMPLETED)) return { flag: false, reason: 'already_completed' };
  if (has(SURVEY_STATUS.PENDING)) return { flag: false, reason: 'already_pending' };

  const refusals = assignmentsToday.filter((a) => a.status === SURVEY_STATUS.REFUSED).length;
  if (refusals >= config.maxRefusalsPerDay) return { flag: false, reason: 'refusal_cap_reached' };

  // After a refusal/release the very next call is flagged again.
  const lastResolved = assignmentsToday[assignmentsToday.length - 1];
  if (lastResolved && (lastResolved.status === SURVEY_STATUS.REFUSED || lastResolved.status === SURVEY_STATUS.RELEASED)) {
    return { flag: true, reason: 'retry_after_' + lastResolved.status.toLowerCase() };
  }

  const k = targetIndexFor(userId, workDate, config.windowMax);
  if (callsToday >= k) return { flag: true, reason: 'target_reached' };
  return { flag: false, reason: 'before_target' };
}

/** Complete is allowed unless the turn has a PENDING survey. */
export function canComplete(assignment) {
  return !assignment || assignment.status !== SURVEY_STATUS.PENDING;
}

/** New status when a turn is deferred (returned to queue); null = no change. */
export function statusOnDefer(assignment) {
  return assignment && assignment.status === SURVEY_STATUS.PENDING ? SURVEY_STATUS.RELEASED : null;
}

/** New status when an admin force-completes a turn; null = no change. */
export function statusOnAdminComplete(assignment) {
  return assignment && assignment.status === SURVEY_STATUS.PENDING ? SURVEY_STATUS.ADMIN_BYPASS : null;
}

/**
 * Validate a (partial) config update from the admin API.
 * @returns {{error: string|null, patch: object}}
 */
export function validateSurveyConfigUpdate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Cuerpo inválido', patch: {} };
  }
  const patch = {};

  if ('enabled' in body) {
    if (typeof body.enabled !== 'boolean') return { error: 'enabled debe ser booleano', patch: {} };
    patch.enabled = body.enabled;
  }
  if ('mode' in body) {
    if (!MODES.includes(body.mode)) return { error: 'mode debe ser iframe o qr', patch: {} };
    patch.mode = body.mode;
  }
  if ('windowMax' in body) {
    if (!Number.isInteger(body.windowMax) || body.windowMax < 1 || body.windowMax > 20) {
      return { error: 'windowMax debe ser un entero entre 1 y 20', patch: {} };
    }
    patch.windowMax = body.windowMax;
  }
  if ('maxRefusalsPerDay' in body) {
    if (!Number.isInteger(body.maxRefusalsPerDay) || body.maxRefusalsPerDay < 0 || body.maxRefusalsPerDay > 10) {
      return { error: 'maxRefusalsPerDay debe ser un entero entre 0 y 10', patch: {} };
    }
    patch.maxRefusalsPerDay = body.maxRefusalsPerDay;
  }
  if ('url' in body) {
    let ok = false;
    try {
      ok = typeof body.url === 'string' && new URL(body.url).protocol === 'https:';
    } catch {
      ok = false;
    }
    if (!ok) return { error: 'url debe ser una URL https válida', patch: {} };
    patch.url = body.url;
  }

  if (Object.keys(patch).length === 0) return { error: 'No hay campos para actualizar', patch: {} };
  return { error: null, patch };
}

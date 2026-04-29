/**
 * Lógica pura de la cola FIFO + lock anti-interrupción del queue-tv.js (v2.8.52).
 *
 * Esta función decide qué hacer con los pacientes que vienen del polling:
 * - Si hay audio activo (audioPlaying=true), encola sin interrumpir.
 * - Si no hay audio activo y no hay paciente actual, toma el primero y encola el resto.
 * - Si hay paciente actual pero audio aún no se inició (estado intermedio), encola.
 *
 * Garantía crítica: NUNCA cambia callingPatient/isCalling cuando audioPlaying=true.
 * Esto previene la interrupción reportada por Carlos (INER, 2026-04-29).
 */

/**
 * @typedef {Object} TvState
 * @property {{id: number, patientName: string} | null} callingPatient
 * @property {boolean} isCalling
 * @property {Array<{id: number, patientName: string}>} callQueue
 * @property {number | null} currentCallId
 * @property {boolean} audioPlaying
 */

/**
 * Procesa los turnos entrantes del polling y devuelve el nuevo estado.
 * Pura: no muta el estado de entrada, retorna uno nuevo.
 *
 * @param {TvState} state - Estado actual de la TV
 * @param {Array<{id: number}>} incomingTurns - inCallingTurns del backend
 * @returns {TvState} Nuevo estado
 */
export function processIncomingTurns(state, incomingTurns) {
  const turns = incomingTurns || [];

  // Caso 1: backend dice "no hay llamados activos"
  if (turns.length === 0) {
    // Sync defensivo: si local tiene isCalling pero ya no hay paciente actual ni audio, resetear
    if (state.isCalling && !state.callingPatient && !state.audioPlaying) {
      return { ...state, isCalling: false };
    }
    return state;
  }

  // Caso 2: hay audio activo → SOLO encolar, NO tocar callingPatient/isCalling
  if (state.audioPlaying) {
    const seen = new Set([
      state.currentCallId,
      ...state.callQueue.map(p => p.id),
    ].filter(Boolean));
    const additions = turns.filter(p => !seen.has(p.id));
    if (additions.length === 0) return state;
    return { ...state, callQueue: [...state.callQueue, ...additions] };
  }

  // Caso 3: no hay audio activo y no hay paciente actual → empezar con el primero
  if (!state.isCalling && !state.callingPatient) {
    const next = turns[0];
    const rest = turns.slice(1);
    let newQueue = state.callQueue;
    if (rest.length > 0) {
      const seen = new Set([next.id, ...state.callQueue.map(p => p.id)]);
      const additions = rest.filter(p => !seen.has(p.id));
      if (additions.length > 0) newQueue = [...state.callQueue, ...additions];
    }
    return {
      ...state,
      callingPatient: next,
      isCalling: true,
      callQueue: newQueue,
    };
  }

  // Caso 4: isCalling=true pero audioPlaying aún false (transición) → encolar
  const seen = new Set([
    state.callingPatient?.id,
    ...state.callQueue.map(p => p.id),
  ].filter(Boolean));
  const additions = turns.filter(p => !seen.has(p.id));
  if (additions.length === 0) return state;
  return { ...state, callQueue: [...state.callQueue, ...additions] };
}

/**
 * Promueve el siguiente paciente de la cola al terminar el audio actual.
 * Libera los locks (audioPlaying, currentCallId) antes de promover.
 *
 * @param {TvState} state
 * @returns {TvState}
 */
export function promoteNextFromQueue(state) {
  const released = {
    ...state,
    audioPlaying: false,
    currentCallId: null,
  };

  if (state.callQueue.length === 0) {
    return {
      ...released,
      callingPatient: null,
      isCalling: false,
    };
  }

  const [next, ...rest] = state.callQueue;
  return {
    ...released,
    callingPatient: next,
    isCalling: true,
    callQueue: rest,
  };
}

/**
 * Toma el lock al iniciar el audio. Marca el ID activo y audioPlaying=true.
 * @param {TvState} state
 * @param {number} callId
 * @returns {TvState}
 */
export function acquireAudioLock(state, callId) {
  return {
    ...state,
    currentCallId: callId,
    audioPlaying: true,
  };
}

/**
 * Estado inicial de la TV.
 * @returns {TvState}
 */
export function initialTvState() {
  return {
    callingPatient: null,
    isCalling: false,
    callQueue: [],
    currentCallId: null,
    audioPlaying: false,
  };
}

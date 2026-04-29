/**
 * Regresión v2.8.52 — bug Carlos 2026-04-29
 *
 * Garantía CRÍTICA: mientras audioPlaying=true, NINGÚN polling puede cambiar
 * callingPatient/isCalling. El audio activo es inmutable hasta que él mismo
 * termine y libere el lock.
 *
 * Este test valida la lógica del lock anti-interrupción definida en
 * lib/queueTvFifo.js (espejo de la lógica inline en pages/turns/queue-tv.js).
 */

import {
  initialTvState,
  processIncomingTurns,
  promoteNextFromQueue,
  acquireAudioLock,
} from '../../lib/queueTvFifo.js';

describe('Lock anti-interrupción: audio activo nunca se corta', () => {
  test('callingPatient NO cambia mientras audioPlaying=true, aunque llegue un paciente nuevo', () => {
    let s = initialTvState();
    s = processIncomingTurns(s, [{ id: 100, patientName: 'A' }]);
    s = acquireAudioLock(s, 100);

    const before = { ...s, callQueue: [...s.callQueue] };

    // Polling trae múltiples nuevos
    s = processIncomingTurns(s, [
      { id: 100, patientName: 'A' },
      { id: 200, patientName: 'B' },
      { id: 300, patientName: 'C' },
    ]);

    // INVARIANTE CRÍTICO: callingPatient sigue siendo A
    expect(s.callingPatient.id).toBe(100);
    expect(s.callingPatient.id).toBe(before.callingPatient.id);
    expect(s.isCalling).toBe(before.isCalling);
    expect(s.audioPlaying).toBe(true);
    expect(s.currentCallId).toBe(100);
    // Solo se modifica callQueue
    expect(s.callQueue.map(p => p.id)).toEqual([200, 300]);
  });

  test('múltiples polls durante audio: callingPatient permanece estable, cola crece', () => {
    let s = initialTvState();
    s = processIncomingTurns(s, [{ id: 1 }]);
    s = acquireAudioLock(s, 1);

    const polls = [
      [{ id: 1 }, { id: 2 }],
      [{ id: 1 }, { id: 2 }, { id: 3 }],
      [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
      [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
    ];

    for (const poll of polls) {
      s = processIncomingTurns(s, poll);
      expect(s.callingPatient.id).toBe(1); // SIEMPRE
      expect(s.audioPlaying).toBe(true);
    }

    expect(s.callQueue.map(p => p.id)).toEqual([2, 3, 4, 5]);
  });

  test('cuando termina audio (promoteNextFromQueue), entonces sí cambia callingPatient', () => {
    let s = initialTvState();
    s = processIncomingTurns(s, [{ id: 1 }, { id: 2 }]);
    s = acquireAudioLock(s, 1);

    expect(s.callingPatient.id).toBe(1);

    s = promoteNextFromQueue(s);

    // Lock liberado, B promovido
    expect(s.audioPlaying).toBe(false);
    expect(s.currentCallId).toBeNull();
    expect(s.callingPatient.id).toBe(2);
    expect(s.isCalling).toBe(true);
  });

  test('lock impide que callingPatient quede null mientras audio suena (race con polling vacío)', () => {
    let s = initialTvState();
    s = processIncomingTurns(s, [{ id: 1 }]);
    s = acquireAudioLock(s, 1);

    // Backend dice "no hay llamados activos" (porque el cliente queue.js panel
    // ya marcó isCalled=true antes que la TV termine de anunciar)
    s = processIncomingTurns(s, []);

    // Sin lock anti-interrupción, este sería un caso donde isCalling cae a false.
    // Con lock: el state queda intacto porque audioPlaying=true.
    expect(s.callingPatient.id).toBe(1);
    expect(s.isCalling).toBe(true);
    expect(s.audioPlaying).toBe(true);
  });

  test('caso reportado por Carlos: 2 flebotomistas llaman casi simultáneo, ambos se anuncian', () => {
    // Simula: poll 1 trae A, poll 2 (después de iniciar audio A) trae A+B,
    // audio A termina, B se promueve y suena.
    let s = initialTvState();

    // Poll 1
    s = processIncomingTurns(s, [{ id: 100, patientName: 'Juan' }]);
    expect(s.callingPatient.patientName).toBe('Juan');
    s = acquireAudioLock(s, 100);

    // Poll 2 (durante audio de Juan): llega Maria
    s = processIncomingTurns(s, [
      { id: 100, patientName: 'Juan' },
      { id: 200, patientName: 'Maria' },
    ]);
    expect(s.callingPatient.patientName).toBe('Juan'); // No interrumpido
    expect(s.callQueue[0].patientName).toBe('Maria');

    // Audio Juan termina
    s = promoteNextFromQueue(s);
    expect(s.callingPatient.patientName).toBe('Maria');
    s = acquireAudioLock(s, 200);

    // Polling siguiente (backend ya no tiene a Juan, solo Maria si aún no marcó isCalled)
    s = processIncomingTurns(s, [{ id: 200, patientName: 'Maria' }]);
    expect(s.callingPatient.patientName).toBe('Maria');

    // Audio Maria termina
    s = promoteNextFromQueue(s);
    expect(s.callingPatient).toBeNull();
    expect(s.callQueue).toEqual([]);
  });
});

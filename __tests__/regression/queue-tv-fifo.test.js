/**
 * Regresión v2.8.52 — bug Carlos 2026-04-29
 * "Se corta el llamado del paciente cuando alguien más hace otro llamado"
 *
 * Garantía: la cola FIFO de queue-tv.js (TV de sala de espera) procesa los
 * llamados en orden sin perder ninguno cuando varios llegan en la misma
 * ventana de polling.
 *
 * Estos tests cubren la lógica pura definida en lib/queueTvFifo.js, que es
 * la misma que se aplica inline en pages/turns/queue-tv.js.
 */

import {
  initialTvState,
  processIncomingTurns,
  promoteNextFromQueue,
  acquireAudioLock,
} from '../../lib/queueTvFifo.js';

describe('cola FIFO de queue-tv: 3 llamados consecutivos no se pierden', () => {
  test('estado inicial limpio', () => {
    const s = initialTvState();
    expect(s.callingPatient).toBeNull();
    expect(s.isCalling).toBe(false);
    expect(s.callQueue).toEqual([]);
    expect(s.audioPlaying).toBe(false);
  });

  test('primer paciente se asigna inmediatamente, no a la cola', () => {
    const s0 = initialTvState();
    const s1 = processIncomingTurns(s0, [{ id: 1, patientName: 'A' }]);
    expect(s1.callingPatient.id).toBe(1);
    expect(s1.isCalling).toBe(true);
    expect(s1.callQueue).toEqual([]);
  });

  test('si vienen 3 pacientes juntos en el primer poll, primero va activo y los otros 2 van a la cola', () => {
    const s0 = initialTvState();
    const turns = [
      { id: 1, patientName: 'A' },
      { id: 2, patientName: 'B' },
      { id: 3, patientName: 'C' },
    ];
    const s1 = processIncomingTurns(s0, turns);
    expect(s1.callingPatient.id).toBe(1);
    expect(s1.callQueue.map(p => p.id)).toEqual([2, 3]);
  });

  test('llamados que llegan durante audio activo van a la cola, no interrumpen', () => {
    let s = initialTvState();
    s = processIncomingTurns(s, [{ id: 1, patientName: 'A' }]);
    s = acquireAudioLock(s, 1); // simular que el audio empezó

    expect(s.audioPlaying).toBe(true);
    expect(s.callingPatient.id).toBe(1);

    // Llega B mientras A suena
    const beforeB = s;
    s = processIncomingTurns(s, [{ id: 1, patientName: 'A' }, { id: 2, patientName: 'B' }]);

    // callingPatient debe seguir siendo A (no se interrumpió)
    expect(s.callingPatient.id).toBe(1);
    expect(s.isCalling).toBe(true);
    // B debe estar en la cola
    expect(s.callQueue.map(p => p.id)).toEqual([2]);
  });

  test('al terminar audio del actual, promueve el siguiente de la cola', () => {
    let s = initialTvState();
    s = processIncomingTurns(s, [{ id: 1, patientName: 'A' }, { id: 2, patientName: 'B' }]);
    s = acquireAudioLock(s, 1);
    // ... audio de A reproduce y termina ...
    s = promoteNextFromQueue(s);

    // Locks liberados
    expect(s.audioPlaying).toBe(false);
    expect(s.currentCallId).toBeNull();
    // B promovido
    expect(s.callingPatient.id).toBe(2);
    expect(s.isCalling).toBe(true);
    expect(s.callQueue).toEqual([]);
  });

  test('si la cola queda vacía al terminar, callingPatient queda null', () => {
    let s = initialTvState();
    s = processIncomingTurns(s, [{ id: 1, patientName: 'A' }]);
    s = acquireAudioLock(s, 1);
    s = promoteNextFromQueue(s);

    expect(s.callingPatient).toBeNull();
    expect(s.isCalling).toBe(false);
    expect(s.callQueue).toEqual([]);
  });

  test('3 llamados consecutivos en polls separados se anuncian todos en orden', () => {
    let s = initialTvState();

    // Poll 1: llega A
    s = processIncomingTurns(s, [{ id: 1, patientName: 'A' }]);
    s = acquireAudioLock(s, 1);
    expect(s.callingPatient.id).toBe(1);

    // Poll 2: durante audio de A, llega B
    s = processIncomingTurns(s, [{ id: 1 }, { id: 2, patientName: 'B' }]);
    expect(s.callingPatient.id).toBe(1); // sigue A
    expect(s.callQueue.map(p => p.id)).toEqual([2]);

    // Poll 3: durante audio de A, llega C
    s = processIncomingTurns(s, [{ id: 1 }, { id: 2 }, { id: 3, patientName: 'C' }]);
    expect(s.callingPatient.id).toBe(1); // sigue A
    expect(s.callQueue.map(p => p.id)).toEqual([2, 3]);

    // Audio A termina → promueve B
    s = promoteNextFromQueue(s);
    s = acquireAudioLock(s, 2);
    expect(s.callingPatient.id).toBe(2);
    expect(s.callQueue.map(p => p.id)).toEqual([3]);

    // Audio B termina → promueve C
    s = promoteNextFromQueue(s);
    s = acquireAudioLock(s, 3);
    expect(s.callingPatient.id).toBe(3);
    expect(s.callQueue).toEqual([]);

    // Audio C termina → vacío
    s = promoteNextFromQueue(s);
    expect(s.callingPatient).toBeNull();
  });

  test('no agrega duplicados: si un paciente ya está en cola, no se mete dos veces', () => {
    let s = initialTvState();
    s = processIncomingTurns(s, [{ id: 1 }]);
    s = acquireAudioLock(s, 1);
    s = processIncomingTurns(s, [{ id: 1 }, { id: 2 }]);
    s = processIncomingTurns(s, [{ id: 1 }, { id: 2 }]); // mismo poll otra vez

    expect(s.callQueue.map(p => p.id)).toEqual([2]);
  });

  test('sync defensivo: si backend no tiene llamados pero local tiene isCalling huérfano, resetea', () => {
    const orphanState = {
      callingPatient: null,
      isCalling: true,
      callQueue: [],
      currentCallId: null,
      audioPlaying: false,
    };
    const s = processIncomingTurns(orphanState, []);
    expect(s.isCalling).toBe(false);
  });

  test('sync defensivo NO resetea si hay audio activo (lock)', () => {
    const playingState = {
      callingPatient: { id: 1 },
      isCalling: true,
      callQueue: [],
      currentCallId: 1,
      audioPlaying: true,
    };
    const s = processIncomingTurns(playingState, []);
    // No debería tocar nada
    expect(s).toBe(playingState);
  });
});

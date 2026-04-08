/**
 * Tests Unitarios: calculateDurationMinutes
 * Sistema TomaTurnoModerno - INER
 *
 * Función pura usada por el endpoint /api/statistics/patient-stats
 * para calcular la duración en minutos de un turno atendido.
 */

import { calculateDurationMinutes } from '../lib/patientStatsUtils.js';

describe('calculateDurationMinutes', () => {
  test('caso normal: 5 minutos exactos', () => {
    const start = new Date('2026-04-08T07:30:00.000Z');
    const end = new Date('2026-04-08T07:35:00.000Z');
    expect(calculateDurationMinutes(start, end)).toBe(5);
  });

  test('caso normal: 7.5 minutos (medio minuto)', () => {
    const start = new Date('2026-04-08T07:30:00.000Z');
    const end = new Date('2026-04-08T07:37:30.000Z');
    expect(calculateDurationMinutes(start, end)).toBe(7.5);
  });

  test('redondeo a 1 decimal', () => {
    const start = new Date('2026-04-08T07:30:00.000Z');
    const end = new Date('2026-04-08T07:30:20.000Z'); // 0.333... min
    expect(calculateDurationMinutes(start, end)).toBe(0.3);
  });

  test('mismo timestamp inicio y fin → 0', () => {
    const ts = new Date('2026-04-08T07:30:00.000Z');
    expect(calculateDurationMinutes(ts, ts)).toBe(0);
  });

  test('duración negativa (data corrupta) → 0', () => {
    const start = new Date('2026-04-08T07:35:00.000Z');
    const end = new Date('2026-04-08T07:30:00.000Z'); // end antes que start
    expect(calculateDurationMinutes(start, end)).toBe(0);
  });

  test('duración mayor a 4h → cap en 240 min', () => {
    const start = new Date('2026-04-08T07:00:00.000Z');
    const end = new Date('2026-04-08T15:00:00.000Z'); // 8h
    expect(calculateDurationMinutes(start, end)).toBe(240);
  });

  test('duración exacta de 4h → 240', () => {
    const start = new Date('2026-04-08T07:00:00.000Z');
    const end = new Date('2026-04-08T11:00:00.000Z');
    expect(calculateDurationMinutes(start, end)).toBe(240);
  });

  test('startTime null → 0', () => {
    const end = new Date('2026-04-08T07:35:00.000Z');
    expect(calculateDurationMinutes(null, end)).toBe(0);
  });

  test('endTime null → 0', () => {
    const start = new Date('2026-04-08T07:30:00.000Z');
    expect(calculateDurationMinutes(start, null)).toBe(0);
  });

  test('ambos null → 0', () => {
    expect(calculateDurationMinutes(null, null)).toBe(0);
  });

  test('strings ISO en lugar de Date funciona', () => {
    const start = '2026-04-08T07:30:00.000Z';
    const end = '2026-04-08T07:38:00.000Z';
    expect(calculateDurationMinutes(start, end)).toBe(8);
  });

  test('input inválido (NaN) → 0', () => {
    expect(calculateDurationMinutes('not-a-date', new Date())).toBe(0);
  });
});

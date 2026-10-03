import {
  ROW_STATUS,
  classifyRow,
  computeCompliance,
  validateRange,
  presetRange,
  matchPreset,
  formatWorkDate,
  parseDay,
  buildSettingsPayload
} from '../lib/surveyReportUi.js';

const row = (over = {}) => ({
  assigned: 1,
  completed: 0,
  refused: 0,
  released: 0,
  adminBypass: 0,
  pending: 0,
  ...over
});

describe('classifyRow', () => {
  test('completed wins over everything', () => {
    expect(classifyRow(row({ completed: 1, refused: 2, pending: 1 }))).toBe(ROW_STATUS.MET);
  });
  test('pending beats refused when nothing completed', () => {
    expect(classifyRow(row({ pending: 1, refused: 1 }))).toBe(ROW_STATUS.PENDING);
  });
  test('refused only', () => {
    expect(classifyRow(row({ refused: 2 }))).toBe(ROW_STATUS.REFUSED);
  });
  test('released / admin bypass only means no survey', () => {
    expect(classifyRow(row({ released: 1 }))).toBe(ROW_STATUS.NONE);
    expect(classifyRow(row({ adminBypass: 1 }))).toBe(ROW_STATUS.NONE);
  });
  test('null row is none', () => {
    expect(classifyRow(null)).toBe(ROW_STATUS.NONE);
  });
});

describe('computeCompliance', () => {
  test('empty rows give null percent', () => {
    expect(computeCompliance([])).toEqual({ compliant: 0, total: 0, percent: null });
    expect(computeCompliance()).toEqual({ compliant: 0, total: 0, percent: null });
  });
  test('counts phlebotomist-days with >= 1 completed', () => {
    const rows = [row({ completed: 1 }), row({ completed: 3 }), row({ refused: 1 }), row({ pending: 1 })];
    expect(computeCompliance(rows)).toEqual({ compliant: 2, total: 4, percent: 50 });
  });
  test('rounds to nearest integer', () => {
    const rows = [row({ completed: 1 }), row(), row()];
    expect(computeCompliance(rows).percent).toBe(33);
  });
  test('100% when all comply', () => {
    expect(computeCompliance([row({ completed: 1 })]).percent).toBe(100);
  });
});

describe('validateRange', () => {
  test('accepts a single day and exactly 93 days', () => {
    expect(validateRange('2026-03-19', '2026-03-19')).toBeNull();
    expect(validateRange('2026-01-01', '2026-04-03')).toBeNull(); // 31+28+31+3 = 93 days
  });
  test('rejects 94 days', () => {
    expect(validateRange('2026-01-01', '2026-04-04')).toMatch(/93/);
  });
  test('rejects inverted and invalid dates', () => {
    expect(validateRange('2026-03-20', '2026-03-19')).toMatch(/posterior/);
    expect(validateRange('2026-02-31', '2026-03-01')).toMatch(/válidas/);
    expect(validateRange('', '2026-03-01')).toMatch(/válidas/);
  });
});

describe('presetRange', () => {
  test('today', () => {
    expect(presetRange('today', '2026-03-19')).toEqual({ from: '2026-03-19', to: '2026-03-19' });
  });
  test('last7 is inclusive of today and crosses month boundaries', () => {
    expect(presetRange('last7', '2026-03-19')).toEqual({ from: '2026-03-13', to: '2026-03-19' });
    expect(presetRange('last7', '2026-03-03')).toEqual({ from: '2026-02-25', to: '2026-03-03' });
  });
  test('month starts on the 1st', () => {
    expect(presetRange('month', '2026-03-19')).toEqual({ from: '2026-03-01', to: '2026-03-19' });
  });
  test('unknown preset and bad today throw', () => {
    expect(() => presetRange('year', '2026-03-19')).toThrow();
    expect(() => presetRange('today', 'nope')).toThrow();
  });
});

describe('matchPreset / formatWorkDate / parseDay', () => {
  test('matchPreset finds the active preset or null', () => {
    expect(matchPreset('2026-03-19', '2026-03-19', '2026-03-19')).toBe('today');
    expect(matchPreset('2026-03-13', '2026-03-19', '2026-03-19')).toBe('last7');
    expect(matchPreset('2026-03-01', '2026-03-10', '2026-03-19')).toBeNull();
  });
  test('formatWorkDate', () => {
    expect(formatWorkDate('2026-03-19')).toBe('19/03/2026');
    expect(formatWorkDate('garbage')).toBe('garbage');
  });
  test('parseDay rejects impossible dates', () => {
    expect(parseDay('2026-02-30')).toBeNull();
    expect(parseDay('2026-02-28')).not.toBeNull();
  });
});

describe('buildSettingsPayload', () => {
  const ok = { enabled: true, mode: 'qr', windowMax: '5', maxRefusalsPerDay: '3', url: ' https://example.org/s ' };

  test('coerces numeric strings and trims url', () => {
    const { error, payload } = buildSettingsPayload(ok);
    expect(error).toBeNull();
    expect(payload).toEqual({
      enabled: true,
      mode: 'qr',
      windowMax: 5,
      maxRefusalsPerDay: 3,
      url: 'https://example.org/s'
    });
  });
  test('enabled is strictly boolean', () => {
    expect(buildSettingsPayload({ ...ok, enabled: 'true' }).payload.enabled).toBe(false);
  });
  test('rejects out-of-range and non-integer numbers', () => {
    expect(buildSettingsPayload({ ...ok, windowMax: '0' }).error).toMatch(/ventana/);
    expect(buildSettingsPayload({ ...ok, windowMax: '21' }).error).toMatch(/ventana/);
    expect(buildSettingsPayload({ ...ok, windowMax: '2.5' }).error).toMatch(/ventana/);
    expect(buildSettingsPayload({ ...ok, maxRefusalsPerDay: '11' }).error).toMatch(/negativas/);
    expect(buildSettingsPayload({ ...ok, maxRefusalsPerDay: '' }).error).toMatch(/negativas/);
  });
  test('allows 0 refusals', () => {
    expect(buildSettingsPayload({ ...ok, maxRefusalsPerDay: '0' }).payload.maxRefusalsPerDay).toBe(0);
  });
  test('rejects http and garbage urls, and bad mode', () => {
    expect(buildSettingsPayload({ ...ok, url: 'http://example.org' }).error).toMatch(/https/);
    expect(buildSettingsPayload({ ...ok, url: 'nope' }).error).toMatch(/https/);
    expect(buildSettingsPayload({ ...ok, mode: 'popup' }).error).toMatch(/modo/);
  });
});

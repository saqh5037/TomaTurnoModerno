import {
  resolveSurveyConfig,
  targetIndexFor,
  shouldFlagTurn,
  canComplete,
  statusOnDefer,
  statusOnAdminComplete,
  workDateFor,
  workDateBounds,
  DEFAULT_SURVEY_CONFIG
} from '../lib/surveyGate.js';

const DAY = '2026-03-19';
const enabled = (over = {}) => resolveSurveyConfig({ enabled: true, ...over });
const flag = (over) =>
  shouldFlagTurn({ config: enabled(), callsToday: 1, assignmentsToday: [], userId: 7, workDate: DAY, ...over });

describe('resolveSurveyConfig', () => {
  test('missing/invalid input returns defaults (disabled)', () => {
    expect(resolveSurveyConfig(null)).toEqual(DEFAULT_SURVEY_CONFIG);
    expect(resolveSurveyConfig('not json')).toEqual(DEFAULT_SURVEY_CONFIG);
    expect(resolveSurveyConfig(undefined).enabled).toBe(false);
  });

  test('parses JSON string and keeps valid fields', () => {
    const cfg = resolveSurveyConfig(JSON.stringify({ enabled: true, mode: 'qr', windowMax: 3, maxRefusalsPerDay: 0 }));
    expect(cfg).toMatchObject({ enabled: true, mode: 'qr', windowMax: 3, maxRefusalsPerDay: 0 });
  });

  test('out-of-range or non-https values fall back to defaults', () => {
    const cfg = resolveSurveyConfig({ enabled: true, mode: 'x', windowMax: 99, maxRefusalsPerDay: -1, url: 'http://a.b' });
    expect(cfg.mode).toBe('iframe');
    expect(cfg.windowMax).toBe(5);
    expect(cfg.maxRefusalsPerDay).toBe(3);
    expect(cfg.url).toBe(DEFAULT_SURVEY_CONFIG.url);
  });
});

describe('targetIndexFor', () => {
  test('is stable for the same (user, day)', () => {
    expect(targetIndexFor(7, DAY, 5)).toBe(targetIndexFor(7, DAY, 5));
  });

  test('always within [1..windowMax]', () => {
    for (let u = 1; u <= 200; u++) {
      for (const max of [1, 2, 5, 20]) {
        const k = targetIndexFor(u, DAY, max);
        expect(k).toBeGreaterThanOrEqual(1);
        expect(k).toBeLessThanOrEqual(max);
      }
    }
  });

  test('windowMax=1 always yields 1', () => {
    expect(targetIndexFor(123, DAY, 1)).toBe(1);
  });

  test('spreads across the window (not constant)', () => {
    const seen = new Set();
    for (let u = 1; u <= 100; u++) seen.add(targetIndexFor(u, DAY, 5));
    expect(seen.size).toBe(5);
  });
});

describe('shouldFlagTurn', () => {
  test('disabled never flags', () => {
    const r = shouldFlagTurn({ config: resolveSurveyConfig({ enabled: false, windowMax: 1 }), callsToday: 10, assignmentsToday: [], userId: 7, workDate: DAY });
    expect(r).toEqual({ flag: false, reason: 'disabled' });
  });

  test('flags exactly from the K-th call, not before', () => {
    const k = targetIndexFor(7, DAY, 5);
    for (let n = 1; n < k; n++) expect(flag({ callsToday: n }).flag).toBe(false);
    expect(flag({ callsToday: k })).toEqual({ flag: true, reason: 'target_reached' });
  });

  test('windowMax=1 flags the first call of the day', () => {
    expect(flag({ config: enabled({ windowMax: 1 }), callsToday: 1 }).flag).toBe(true);
  });

  test('no flag once a COMPLETED exists', () => {
    const r = flag({ callsToday: 9, assignmentsToday: [{ status: 'REFUSED' }, { status: 'COMPLETED' }] });
    expect(r).toEqual({ flag: false, reason: 'already_completed' });
  });

  test('refusal -> next call flagged even before K', () => {
    const r = flag({ config: enabled({ windowMax: 20 }), callsToday: 1, assignmentsToday: [{ status: 'REFUSED' }] });
    expect(r).toEqual({ flag: true, reason: 'retry_after_refused' });
  });

  test('release -> next call flagged even before K', () => {
    const r = flag({ config: enabled({ windowMax: 20 }), callsToday: 1, assignmentsToday: [{ status: 'RELEASED' }] });
    expect(r).toEqual({ flag: true, reason: 'retry_after_released' });
  });

  test('maxRefusalsPerDay caps further flags', () => {
    const three = [{ status: 'REFUSED' }, { status: 'REFUSED' }, { status: 'REFUSED' }];
    expect(flag({ callsToday: 9, assignmentsToday: three })).toEqual({ flag: false, reason: 'refusal_cap_reached' });
    expect(flag({ callsToday: 9, assignmentsToday: three.slice(0, 2) }).flag).toBe(true);
  });

  test('maxRefusalsPerDay=0 means any refusal stops the day', () => {
    const r = flag({ config: enabled({ maxRefusalsPerDay: 0 }), callsToday: 9, assignmentsToday: [{ status: 'REFUSED' }] });
    expect(r.flag).toBe(false);
  });

  test('releases do not count towards the refusal cap', () => {
    const rel = [{ status: 'RELEASED' }, { status: 'RELEASED' }, { status: 'RELEASED' }, { status: 'RELEASED' }];
    expect(flag({ callsToday: 9, assignmentsToday: rel }).flag).toBe(true);
  });

  test('existing PENDING prevents a second flag', () => {
    const r = flag({ callsToday: 9, assignmentsToday: [{ status: 'PENDING' }] });
    expect(r).toEqual({ flag: false, reason: 'already_pending' });
  });
});

describe('canComplete / statusOnDefer / statusOnAdminComplete', () => {
  test('canComplete blocks only PENDING', () => {
    expect(canComplete(null)).toBe(true);
    expect(canComplete({ status: 'PENDING' })).toBe(false);
    for (const s of ['COMPLETED', 'REFUSED', 'RELEASED', 'ADMIN_BYPASS']) {
      expect(canComplete({ status: s })).toBe(true);
    }
  });

  test('statusOnDefer releases only PENDING', () => {
    expect(statusOnDefer({ status: 'PENDING' })).toBe('RELEASED');
    expect(statusOnDefer({ status: 'COMPLETED' })).toBeNull();
    expect(statusOnDefer(null)).toBeNull();
  });

  test('statusOnAdminComplete bypasses only PENDING', () => {
    expect(statusOnAdminComplete({ status: 'PENDING' })).toBe('ADMIN_BYPASS');
    expect(statusOnAdminComplete({ status: 'REFUSED' })).toBeNull();
    expect(statusOnAdminComplete(undefined)).toBeNull();
  });
});

describe('work date (America/Mexico_City)', () => {
  test('23:30 Mexico time on the 18th is still the 18th (05:30Z on the 19th)', () => {
    expect(workDateFor(new Date('2026-03-19T05:30:00Z'))).toBe('2026-03-18');
  });

  test('00:00 Mexico time rolls over to the 19th (06:00Z)', () => {
    expect(workDateFor(new Date('2026-03-19T06:00:00Z'))).toBe('2026-03-19');
  });

  test('bounds cover the local day as [06:00Z, next 06:00Z)', () => {
    const { start, end } = workDateBounds('2026-03-19');
    expect(start.toISOString()).toBe('2026-03-19T06:00:00.000Z');
    expect(end.toISOString()).toBe('2026-03-20T06:00:00.000Z');
  });

  test('bounds are consistent with workDateFor', () => {
    const { start, end } = workDateBounds('2026-10-02');
    expect(workDateFor(start)).toBe('2026-10-02');
    expect(workDateFor(new Date(end.getTime() - 1))).toBe('2026-10-02');
    expect(workDateFor(end)).toBe('2026-10-03');
  });
});

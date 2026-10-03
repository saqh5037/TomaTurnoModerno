import { canConfirmSurvey, isValidRefusalReason, toSurveyState } from '../lib/surveyUi';

describe('canConfirmSurvey', () => {
  test('iframe mode needs at least 2 loads', () => {
    expect(canConfirmSurvey({ mode: 'iframe', loads: 0 })).toBe(false);
    expect(canConfirmSurvey({ mode: 'iframe', loads: 1 })).toBe(false);
    expect(canConfirmSurvey({ mode: 'iframe', loads: 2 })).toBe(true);
  });
  test('iframe mode ignores the confirmation checkbox', () => {
    expect(canConfirmSurvey({ mode: 'iframe', loads: 1, confirmed: true })).toBe(false);
  });
  test('qr mode needs explicit confirmation', () => {
    expect(canConfirmSurvey({ mode: 'qr', loads: 5, confirmed: false })).toBe(false);
    expect(canConfirmSurvey({ mode: 'qr', confirmed: true })).toBe(true);
  });
  test('unknown mode never confirms', () => {
    expect(canConfirmSurvey({ mode: 'x', loads: 9, confirmed: true })).toBe(false);
  });
});

describe('isValidRefusalReason', () => {
  test('requires 3+ trimmed characters', () => {
    expect(isValidRefusalReason('')).toBe(false);
    expect(isValidRefusalReason('  ab ')).toBe(false);
    expect(isValidRefusalReason(' abc ')).toBe(true);
    expect(isValidRefusalReason(null)).toBe(false);
  });
});

describe('toSurveyState', () => {
  const cfg = { enabled: true, mode: 'iframe', url: 'https://x' };
  test('returns null when not required or disabled', () => {
    expect(toSurveyState(null)).toBeNull();
    expect(toSurveyState({ surveyRequired: false, surveyConfig: cfg })).toBeNull();
    expect(toSurveyState({ surveyRequired: true, surveyConfig: { ...cfg, enabled: false } })).toBeNull();
  });
  test('maps call response', () => {
    expect(toSurveyState({ surveyRequired: true, surveyAssignmentId: 7, surveyConfig: cfg })).toEqual({
      required: true, assignmentId: 7, config: { mode: 'iframe', url: 'https://x' },
    });
  });
  test('maps status response and defaults unknown mode to iframe', () => {
    const s = toSurveyState({ surveyRequired: true, assignment: { id: 3 }, surveyConfig: { ...cfg, mode: 'weird' } });
    expect(s.assignmentId).toBe(3);
    expect(s.config.mode).toBe('iframe');
  });
});

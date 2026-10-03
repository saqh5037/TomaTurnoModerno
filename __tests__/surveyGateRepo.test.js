import { evaluateSurveyForCall } from '../lib/surveyGateRepo.js';

const NOW = new Date('2026-03-19T18:00:00Z'); // 12:00 America/Mexico_City

function makeTx({ config, calls = 1, assignments = [], existing = null }) {
  return {
    systemState: {
      findUnique: jest.fn().mockResolvedValue(config ? { value: JSON.stringify(config) } : null)
    },
    turnRequest: { count: jest.fn().mockResolvedValue(calls) },
    surveyAssignment: {
      findMany: jest.fn().mockResolvedValue(assignments),
      upsert: jest.fn().mockImplementation(async ({ create }) => existing || { id: 99, status: 'PENDING', ...create })
    }
  };
}

describe('evaluateSurveyForCall', () => {
  test('disabled / missing config: inert, never touches SurveyAssignment', async () => {
    const tx = makeTx({ config: null });
    const r = await evaluateSurveyForCall(tx, { turnId: 10, userId: 7, now: NOW });
    expect(r.surveyRequired).toBe(false);
    expect(r.surveyAssignmentId).toBeNull();
    expect(r.surveyConfig.enabled).toBe(false);
    expect(tx.turnRequest.count).not.toHaveBeenCalled();
    expect(tx.surveyAssignment.findMany).not.toHaveBeenCalled();
    expect(tx.surveyAssignment.upsert).not.toHaveBeenCalled();
  });

  test('windowMax=1 flags the first call and creates a PENDING assignment for the Mexico day', async () => {
    const tx = makeTx({ config: { enabled: true, windowMax: 1 }, calls: 1 });
    const r = await evaluateSurveyForCall(tx, { turnId: 10, userId: 7, now: NOW });
    expect(r).toMatchObject({ surveyRequired: true, surveyAssignmentId: 99 });
    expect(tx.surveyAssignment.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: { turnId: 10, userId: 7, workDate: '2026-03-19', mode: 'iframe', status: 'PENDING' } })
    );
  });

  test('queries the Mexico-City day window for the call count', async () => {
    const tx = makeTx({ config: { enabled: true, windowMax: 1 } });
    await evaluateSurveyForCall(tx, { turnId: 10, userId: 7, now: NOW });
    const { calledAt } = tx.turnRequest.count.mock.calls[0][0].where;
    expect(calledAt.gte.toISOString()).toBe('2026-03-19T06:00:00.000Z');
    expect(calledAt.lt.toISOString()).toBe('2026-03-20T06:00:00.000Z');
  });

  test('no flag when the user already completed one today', async () => {
    const tx = makeTx({ config: { enabled: true, windowMax: 1 }, assignments: [{ status: 'COMPLETED' }] });
    const r = await evaluateSurveyForCall(tx, { turnId: 10, userId: 7, now: NOW });
    expect(r.surveyRequired).toBe(false);
    expect(tx.surveyAssignment.upsert).not.toHaveBeenCalled();
  });

  test('refusal -> next call flagged', async () => {
    const tx = makeTx({ config: { enabled: true, windowMax: 20 }, calls: 1, assignments: [{ status: 'REFUSED' }] });
    const r = await evaluateSurveyForCall(tx, { turnId: 11, userId: 7, now: NOW });
    expect(r.surveyRequired).toBe(true);
  });
});

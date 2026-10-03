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

  test('re-called deferred turn: RELEASED row is reset to PENDING with the new owner/day', async () => {
    const tx = makeTx({
      config: { enabled: true, windowMax: 1 },
      calls: 1,
      existing: { id: 55, status: 'RELEASED' }
    });
    tx.surveyAssignment.update = jest.fn().mockResolvedValue({ id: 55, status: 'PENDING' });
    const r = await evaluateSurveyForCall(tx, { turnId: 10, userId: 8, now: NOW });
    expect(tx.surveyAssignment.update).toHaveBeenCalledWith({
      where: { id: 55 },
      data: {
        status: 'PENDING', userId: 8, workDate: '2026-03-19', mode: 'iframe',
        resolvedAt: null, resolvedBy: null, refusalReason: null, iframeLoads: null
      }
    });
    expect(r).toMatchObject({ surveyAssignmentId: 55 });
  });

  test('re-called turn whose own RELEASED row exists is looked up so retry-after-release flags', async () => {
    const tx = makeTx({
      config: { enabled: true, windowMax: 20 },
      calls: 1,
      assignments: [{ status: 'RELEASED' }],
      existing: { id: 55, status: 'RELEASED' }
    });
    tx.surveyAssignment.update = jest.fn().mockResolvedValue({ id: 55, status: 'PENDING' });
    const r = await evaluateSurveyForCall(tx, { turnId: 10, userId: 7, now: NOW });
    expect(r.surveyRequired).toBe(true);
    const where = tx.surveyAssignment.findMany.mock.calls[0][0].where;
    expect(where.OR).toContainEqual({ turnId: 10, status: 'RELEASED' });
  });

  test('re-called deferred turn with RELEASED row is untouched when the gate says no (refusal cap)', async () => {
    const tx = makeTx({
      config: { enabled: true, windowMax: 20, maxRefusalsPerDay: 1 },
      calls: 1,
      assignments: [{ status: 'RELEASED' }, { status: 'REFUSED' }],
      existing: { id: 55, status: 'RELEASED' }
    });
    tx.surveyAssignment.update = jest.fn();
    const r = await evaluateSurveyForCall(tx, { turnId: 10, userId: 7, now: NOW });
    expect(r).toMatchObject({ surveyRequired: false, surveyAssignmentId: null });
    expect(tx.surveyAssignment.upsert).not.toHaveBeenCalled();
    expect(tx.surveyAssignment.update).not.toHaveBeenCalled();
  });

  test.each(['COMPLETED', 'REFUSED', 'ADMIN_BYPASS'])('never overwrites an existing %s row', async (status) => {
    const tx = makeTx({
      config: { enabled: true, windowMax: 1 },
      calls: 1,
      existing: { id: 56, status }
    });
    tx.surveyAssignment.update = jest.fn();
    const r = await evaluateSurveyForCall(tx, { turnId: 10, userId: 7, now: NOW });
    expect(tx.surveyAssignment.update).not.toHaveBeenCalled();
    expect(r.surveyRequired).toBe(false);
  });

  test('refusal -> next call flagged', async () => {
    const tx = makeTx({ config: { enabled: true, windowMax: 20 }, calls: 1, assignments: [{ status: 'REFUSED' }] });
    const r = await evaluateSurveyForCall(tx, { turnId: 11, userId: 7, now: NOW });
    expect(r.surveyRequired).toBe(true);
  });
});

import { aggregateSurveyReport } from '../lib/surveyReport.js';

const a = (over) => ({
  turnId: 1, userId: 1, workDate: '2026-03-19', status: 'PENDING',
  user: { name: 'Ana' }, turn: { patientName: 'Paciente' }, ...over
});

describe('aggregateSurveyReport', () => {
  test('empty input yields empty rows and zero totals', () => {
    expect(aggregateSurveyReport([])).toEqual({
      rows: [],
      totals: { assigned: 0, completed: 0, refused: 0, released: 0, adminBypass: 0, pending: 0 }
    });
  });

  test('groups per user and day and counts every status', () => {
    const { rows, totals } = aggregateSurveyReport([
      a({ turnId: 1, status: 'REFUSED', refusalReason: 'No quiso', resolvedAt: new Date('2026-03-19T15:00:00Z') }),
      a({ turnId: 2, status: 'RELEASED' }),
      a({ turnId: 3, status: 'COMPLETED' }),
      a({ turnId: 4, userId: 2, user: { name: 'Beto' }, status: 'PENDING' }),
      a({ turnId: 5, userId: 2, user: { name: 'Beto' }, status: 'ADMIN_BYPASS' }),
      a({ turnId: 6, workDate: '2026-03-18', status: 'COMPLETED' })
    ]);

    expect(rows).toHaveLength(3);
    const ana = rows.find((r) => r.userId === 1 && r.workDate === '2026-03-19');
    expect(ana).toMatchObject({ name: 'Ana', assigned: 3, completed: 1, refused: 1, released: 1, pending: 0 });
    expect(ana.refusals).toEqual([
      { turnId: 1, patientName: 'Paciente', reason: 'No quiso', at: new Date('2026-03-19T15:00:00Z') }
    ]);
    const beto = rows.find((r) => r.userId === 2);
    expect(beto).toMatchObject({ assigned: 2, pending: 1, adminBypass: 1 });
    expect(totals).toEqual({ assigned: 6, completed: 2, refused: 1, released: 1, adminBypass: 1, pending: 1 });
  });

  test('sorts by workDate desc, then name', () => {
    const { rows } = aggregateSurveyReport([
      a({ workDate: '2026-03-18' }),
      a({ userId: 2, user: { name: 'Beto' } }),
      a({ userId: 3, user: { name: 'Ana' } })
    ]);
    expect(rows.map((r) => `${r.workDate}:${r.name}`)).toEqual(['2026-03-19:Ana', '2026-03-19:Beto', '2026-03-18:Ana']);
  });
});

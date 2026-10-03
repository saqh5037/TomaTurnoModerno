/**
 * Survey report aggregation (pure). Groups SurveyAssignment rows by user and work day.
 */

const COUNTER_BY_STATUS = {
  COMPLETED: 'completed',
  REFUSED: 'refused',
  RELEASED: 'released',
  ADMIN_BYPASS: 'adminBypass',
  PENDING: 'pending'
};

const emptyCounters = () => ({
  assigned: 0,
  completed: 0,
  refused: 0,
  released: 0,
  adminBypass: 0,
  pending: 0
});

/**
 * @param {Array<{turnId:number,userId:number,workDate:string,status:string,refusalReason?:string|null,resolvedAt?:Date|null,
 *   user?:{name?:string}, turn?:{patientName?:string}}>} assignments
 * @returns {{rows: Array, totals: object}}
 */
export function aggregateSurveyReport(assignments = []) {
  const byKey = new Map();
  const totals = emptyCounters();

  for (const a of assignments) {
    const key = `${a.userId}|${a.workDate}`;
    if (!byKey.has(key)) {
      byKey.set(key, {
        userId: a.userId,
        name: a.user?.name ?? `#${a.userId}`,
        workDate: a.workDate,
        ...emptyCounters(),
        refusals: []
      });
    }
    const row = byKey.get(key);
    row.assigned += 1;
    totals.assigned += 1;

    const counter = COUNTER_BY_STATUS[a.status];
    if (counter) {
      row[counter] += 1;
      totals[counter] += 1;
    }

    if (a.status === 'REFUSED') {
      row.refusals.push({
        turnId: a.turnId,
        patientName: a.turn?.patientName ?? null,
        reason: a.refusalReason ?? null,
        at: a.resolvedAt ?? null
      });
    }
  }

  const rows = [...byKey.values()].sort((x, y) =>
    x.workDate === y.workDate ? x.name.localeCompare(y.name) : y.workDate.localeCompare(x.workDate)
  );

  return { rows, totals };
}

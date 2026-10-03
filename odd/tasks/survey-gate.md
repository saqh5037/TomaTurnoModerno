# Feature: survey-gate — mandatory random satisfaction survey per phlebotomist

Locator: `odd/tasks/survey-gate.md` (worktree `toma-turno-survey-gate`, branch `feature/survey-gate`, base `fix/auth-refresh-auditlog-v2.8.65`)
Engram mirror: topic `odd/survey-gate/tasks`
Approved plan: `~/.claude/plans/f-jate-que-quiero-una-cheerful-raven.md`

## Objective
At least one REDCap satisfaction survey answered per active phlebotomist per day, on a randomly chosen patient. Mandatory but not blocking: patient may refuse (logged with reason for Brenda) and the next attention of that phlebotomist is flagged again. While pending, "Finish" is blocked; "return to queue" stays allowed.

## Constraints
- No REDCap admin access: Toma-Turno cannot prove submission (cross-origin iframe). Evidence = iframe navigation count (mode `iframe`) or phlebotomist confirmation (mode `qr`).
- Ships with `surveyConfig.enabled=false`. Activation only after Phase 0 spike at INER (REDCap frame headers + full submission inside iframe).
- Production at INER: deploy outside 7–19h, DB backup before migration.
- Out of scope: REDCap answers, auth on call/complete (debt), dead `src/app/api/satisfaction-survey` route (debt).

## TDD
Mode: off (source: no project/session TDD config). Runner: `npm test` (Jest, `__tests__/**/*.test.js`). Pure logic still ships with unit tests.

## Delivery
Strategy: ask-on-risk. Forecast ~900 authored lines → slicing decision required before PR.

## Tasks
- [x] T1 Data + pure logic: `SurveyAssignment` model + migration, `lib/surveyGate.js`, `__tests__/surveyGate.test.js`. Route: delegated (writer trigger: 2+ non-trivial files).
- [x] T2 APIs: gate in `attention/call` + `attention/complete` (409 SURVEY_REQUIRED), release on `queue/defer`, ADMIN_BYPASS on `admin/force-complete`, new `surveys/resolve`, `surveys/report`, `admin/survey-config`. Route: delegated.
- [ ] T3 Phlebotomist UI: `components/survey/SurveyGateModal.jsx` (iframe|qr), badge + modal hook in `pages/turns/attention.js`. Route: delegated (serial UI) + /visual-iterate.
- [ ] T4 Admin UI: `pages/statistics/surveys.js` report + link in `pages/statistics/index.js`, config toggle in `pages/admin/control-panel.js`. Route: delegated (serial UI) + /visual-iterate.
- [ ] T5 Release: bump `lib/version.js`, document feature + Phase 0 checklist in `docs/SURVEY_GATE.md`.

## Acceptance criteria
- With `windowMax=1`, the first call of the day flags the patient (`surveyRequired: true`).
- `POST /api/attention/complete` on a flagged PENDING turn → 409 `SURVEY_REQUIRED`.
- Refusal requires reason → REFUSED; next call by same user is flagged; after `maxRefusalsPerDay` no more flags that day.
- Defer releases (RELEASED) and next call is flagged.
- Once one COMPLETED exists for user+day, no further flags.
- Report shows per phlebotomist/day: assigned, completed, refused (+reasons), pending.
- Feature fully inert with `enabled=false`.

## Progress / evidence
- T1 `b603d3c` (delegated writer). K = FNV-1a(userId|workDate) % windowMax + 1, not stored; workDate 'YYYY-MM-DD' in America/Mexico_City (`lib/surveyGate.js`).
- T2 `2c21a1c` (delegated writer). Contract: call → `surveyRequired`, `surveyAssignmentId`, `surveyConfig{enabled,mode,url}`; complete → 409 `SURVEY_REQUIRED`; `POST /api/surveys/resolve`, `GET /api/surveys/status?turnId=`, `GET /api/surveys/report?from=&to=`, `GET|POST /api/admin/survey-config`.
- Checks: `npm test` 238/243 (5 failures in labsisTubeMapping, identical on base d86add6 — pre-existing); survey suites 45/45 (parent spot check); `npx prisma validate` OK; lint no new issues. Not run: migration against a DB, `next build`.
- Accepted decisions: ADMIN_BYPASS does not satisfy the daily quota; disabling the flag stops enforcing PENDING; server records but does not enforce iframeLoads>=2.
- Open: report/config access limited to admin (supervisors excluded) — resolve in T4.

## Next step
RDD review of T1+T2 slice, then T3.

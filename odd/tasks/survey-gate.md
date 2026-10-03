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
- [x] T2b Hardening from review R3 findings (refusal cap 0, re-called RELEASED turn, best-effort call, route tests, 400 on bad JSON, report range, supervisor read). Route: delegated.
- [x] T2c Survey flag in its own Serializable tx + call route tests. Route: delegated.
- [x] T3 Phlebotomist UI: `components/survey/SurveyGateModal.jsx` (iframe|qr), badge + modal hook in `pages/turns/attention.js`. Route: delegated (serial UI) + /visual-iterate.
- [x] T4 Admin UI: `pages/statistics/surveys.js` report + link in `pages/statistics/index.js`, config toggle in `pages/admin/control-panel.js`. Route: delegated (serial UI) + /visual-iterate.
- [x] T5 Release: bump `lib/version.js`, document feature + Phase 0 checklist in `docs/SURVEY_GATE.md`.

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
- RDD slice T1+T2 (base d86add6): risk medium, consent granted, lineage review-9d283328a20b54c9 approved + acknowledged. 6 advisory findings → T2b.
- T2b `75f9d63`: survey suites 87/87 (parent spot check); full suite 280/285 (5 pre-existing). RDD slice base 13accc8: medium, granted, lineage review-07af9c84c84dda1f approved + acknowledged; 3 advisory findings → T2c.
- T2c `d5fff85`: own Serializable tx + one P2034 retry (best effort); call handler tests (success/reject/retry) + RELEASED-untouched repo test. Full suite 284 pass / 5 pre-existing fail. Gap: real Serializable isolation not exercised against Postgres.
- T3 `a00861a` (delegated) + `ac8f5f5` (parent, visual fixes): /visual-iterate on /dev/survey-gate-demo at 360/768/1280 (dev server :3006). Found + fixed: QR fallback link hidden below modal footer (moved above iframe); badge white-on-yellow.500 contrast ~2.3:1 → yellow.300/gray.900 13.1:1. Flows exercised: iframe submit enables "Encuesta terminada" → resolve {COMPLETED, iframeLoads:2}; QR refusal with reason → {REFUSED}. /turns/attention compiles (200). Survey suites 99/99.
- RDD slice T2c+T3 (base 75f9d63): medium, granted, lineage review-d3821457c3c8ba2a approved + acknowledged. Advisory: R3-stale-409-processing-lock refuted (finally block at attention.js:1155 clears processingTurns); R3-ui-flow-untested → follow-up; R3-iframe-load-heuristic → document in T5.
- T4 `167d801` (delegated) + `fa32576` (parent): /visual-iterate with Playwright API mocks (fake admin session, mocked report/config/dashboard) on /statistics/surveys and /admin/control-panel at 360/768/1280. Report: no overflow, refusal detail expands. Control panel: header actions overflowed 474px at 360 (277px pre-existing + new button) → header wraps, overflow 0 at all widths. Settings modal renders with Fase 0 warning.
- T5: `lib/version.js` v2.8.66 (2026-10-03); `docs/SURVEY_GATE.md` (behavior, config, evidence limits incl. iframe-load heuristic, Phase 0 checklist, deploy/rollback, debt). Migration FK `turnId` changed RESTRICT → CASCADE (seed scripts `generate-50-patients.js`, `seedFullYearData.js` delete TurnRequest); `prisma migrate diff` from base schema matches migration.sql (only `public.` qualifier differs).
- RDD slice T4+T5 (base ac8f5f5): medium, granted, lineage review-e0fab4775cdcf2c6 approved + acknowledged. Fixed: stale settings save after failed reload (form reset + Guardar disabled on loadError); report range desync (shows loaded range + hint). Verified in browser with mocked 500. Not applied: migration edited in place (never applied to any DB, branch unpushed); UI component tests remain debt.
- RDD final slice (base eb5faf9): medium, granted, lineage review-b26163d639d34b79 approved + acknowledged. R3-report-range-format-coupling refuted (API echoes validated YYYY-MM-DD from/to, route.js:33-40,62); UI component tests remain debt.
- Final checks: full suite 316 pass / 5 fail (labsisTubeMapping only; files untouched since base d86add6, diff 0 lines). Not run: migration against a real DB, `next build`, Phase 0 at INER.
- Post-PR checks (2026-10-03): `next build` exit 0 (/statistics/surveys, /turns/attention built). Throwaway postgres:14 container: `prisma migrate deploy` applied all migrations; unique turnId rejects duplicate; default status PENDING; FK rejects unknown turn; delete TurnRequest cascades. `migrate diff` DB→schema shows only pre-existing drift: User.status column/index absent from migrations since before base d86add6 (not introduced here; production must already have it — verify before deploy).
- Decision: report GET open to admin/administrador/supervisor; config POST admin/administrador only.

## Next step
Human-gated only: approve PR #3, merge v2.8.65 lineage first, confirm prod has User.status, Phase 0 at INER, deploy outside 7–19h with DB backup and flag off, then enable.

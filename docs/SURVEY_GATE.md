# Survey Gate — Encuesta obligatoria aleatoria por flebotomista

Version: v2.8.66 · Branch: `feature/survey-gate` · Feature document: `odd/tasks/survey-gate.md`

## Purpose
INER needs each active phlebotomist to get at least one patient per day to answer the REDCap satisfaction survey (`https://redcap-iner.com.mx/surveys/?s=KXTEHHDT8C`). The survey is **mandatory but not blocking**: a patient may refuse, the refusal is recorded with a reason, and the phlebotomist's next attention is flagged again.

## How it works
1. **Random target.** Per phlebotomist and work day (America/Mexico_City), a target K in `1..windowMax` is derived from a hash of `userId|workDate` (stable for the day, not stored). The K-th patient called that day is flagged.
2. **Flag.** On `POST /api/attention/call`, after the patient call commits, the gate runs in its own Serializable transaction (one retry on P2034). A failure never blocks the patient call (`surveyRequired: false`).
3. **Block.** `POST /api/attention/complete` returns `409 SURVEY_REQUIRED` while the turn has a `PENDING` assignment. The attention screen opens the survey modal before completing.
4. **Resolve.** `POST /api/surveys/resolve` with `COMPLETED` or `REFUSED` (reason ≥ 3 chars), then completion continues normally.
5. **Escapes.** Returning the patient to the queue (`/api/queue/defer`) releases the assignment (`RELEASED`), and the next call is flagged. Admin force-complete records `ADMIN_BYPASS` (does not satisfy the daily quota).
6. **Stop conditions.** No more flags that day once one `COMPLETED` exists, or once refusals reach `maxRefusalsPerDay` (`0` = a single refusal ends retries).

Statuses: `PENDING`, `COMPLETED`, `REFUSED`, `RELEASED`, `ADMIN_BYPASS` (table `SurveyAssignment`, one row per turn). Every resolution writes an `AuditLog` entry.

## Configuration
`SystemState` key `surveyConfig` (edited from **Panel de Control → "Encuesta obligatoria"**, admin only; supervisors read-only):

| Field | Default | Meaning |
|---|---|---|
| `enabled` | `false` | Master switch. When off, nothing is flagged or blocked. |
| `mode` | `iframe` | `iframe` embeds REDCap in the modal; `qr` shows a QR for the patient's phone. |
| `windowMax` | `5` | K is drawn from the first N calls of the day (1–20). |
| `maxRefusalsPerDay` | `3` | Refusal cap per phlebotomist per day (0–10). |
| `url` | REDCap URL | Must be https. |

## Evidence limits (read before reporting numbers)
Toma-Turno has no integration with REDCap: it never receives answers and cannot prove a submission.
- **iframe mode:** "Encuesta terminada" enables after the iframe navigates at least once after its first load. Moving to a second page of a multi-page survey, or an error/redirect page, also counts, so the signal can fire before the final submit. The server records `iframeLoads` but does not enforce it.
- **qr mode:** the phlebotomist confirms manually; there is no navigation evidence.
- **Cross-check:** compare the daily `COMPLETED` total in **Estadísticas → Encuestas** (`/statistics/surveys`) against REDCap's own response count.

## Phase 0 — validate at INER before enabling (blocking)
From a PC on the INER network:
1. Open the survey URL with DevTools → Network. Check the document response headers for `X-Frame-Options` or `Content-Security-Policy: frame-ancestors`. If either blocks framing, use `mode: "qr"`.
2. If framing is allowed, enable the feature for a test phlebotomist with `windowMax: 1`, call a test patient, and **answer the full survey inside the modal**. Confirm REDCap registers the response (third-party cookie restrictions can break multi-page surveys inside iframes). If it fails, switch to `qr`.
3. Confirm "¿No carga? Usar código QR" switches the modal to QR when the iframe does not load.

## Deploy (outside 7:00–19:00)
1. Back up the production database.
2. Deploy code, run `npx prisma migrate deploy` (creates `SurveyAssignment`; additive only, `turnId` FK cascades on delete), `npx prisma generate`, rebuild, restart PM2.
3. The feature ships disabled. Enable from the Control Panel only after Phase 0.

**Rollback:** disable `surveyConfig.enabled` (instant, no deploy). A code rollback leaves the `SurveyAssignment` table unused and harmless.

## Dev harness
`/dev/survey-gate-demo?mode=iframe&open=1` and `?mode=qr&open=1` render the modal with a simulated survey (404 in production).

## Known debt (out of scope)
- `attention/call` and `attention/complete` trust `userId` from the client (pre-existing).
- `src/app/api/satisfaction-survey` does not match the `SatisfactionSurvey` schema (dead route, pre-existing).
- Stateful UI flows (modal + attention page) are covered by manual/visual QA, not component tests.

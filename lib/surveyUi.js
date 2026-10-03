// Pure UI rules for the survey gate modal (kept free of React for unit testing).

export const MIN_IFRAME_LOADS = 2; // 1st load = initial form page, 2nd = post-submit navigation
export const MIN_REFUSAL_REASON_LENGTH = 3;

export function canConfirmSurvey({ mode, loads = 0, confirmed = false }) {
  if (mode === 'iframe') return loads >= MIN_IFRAME_LOADS;
  if (mode === 'qr') return confirmed === true;
  return false;
}

export function isValidRefusalReason(reason) {
  return typeof reason === 'string' && reason.trim().length >= MIN_REFUSAL_REASON_LENGTH;
}

// Normalizes the survey fields returned by /api/attention/call or /api/surveys/status.
export function toSurveyState(data) {
  if (!data || !data.surveyRequired || !data.surveyConfig?.enabled) return null;
  return {
    required: true,
    assignmentId: data.surveyAssignmentId ?? data.assignment?.id ?? null,
    config: { mode: data.surveyConfig.mode === 'qr' ? 'qr' : 'iframe', url: data.surveyConfig.url || '' },
  };
}

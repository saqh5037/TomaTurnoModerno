/**
 * Utilidades puras para estadísticas por paciente.
 * Sin dependencias de Next.js, Prisma o cualquier framework
 * para ser fácilmente testeable y reusable.
 */

// Cap en minutos (4 horas) para evitar datos anómalos.
// Mismo cap usado por /api/statistics/dashboard.
export const DURATION_CAP_MIN = 240;

/**
 * Calcula la duración en minutos entre dos timestamps.
 * Maneja datos corruptos (negativo, NaN, null) devolviendo 0.
 * Capa duraciones excesivas en 4h para evitar outliers.
 *
 * @param {Date|string|null} startTime - calledAt o createdAt
 * @param {Date|string|null} endTime - finishedAt
 * @returns {number} duración en minutos, redondeada a 1 decimal
 */
export function calculateDurationMinutes(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  let minutes = (end - start) / 60000;
  if (minutes < 0) minutes = 0;
  if (minutes > DURATION_CAP_MIN) minutes = DURATION_CAP_MIN;
  return Math.round(minutes * 10) / 10;
}

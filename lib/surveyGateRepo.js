/**
 * Survey gate: DB-touching helpers shared by the API routes.
 * `client` is either the prisma client or a transaction client.
 */
import jwt from 'jsonwebtoken';
import {
  resolveSurveyConfig,
  shouldFlagTurn,
  workDateFor,
  workDateBounds
} from './surveyGate.js';
import { buildAuditLogData } from './auditLogData.js';
import { isUserAdmin } from '../src/app/api/users/utils/checkAdmin.js';

export const SURVEY_CONFIG_KEY = 'surveyConfig';

export async function getSurveyConfig(client) {
  const row = await client.systemState.findUnique({ where: { key: SURVEY_CONFIG_KEY } });
  return resolveSurveyConfig(row?.value);
}

/** Public subset of the config sent to the client. */
export function publicSurveyConfig(config) {
  return { enabled: config.enabled, mode: config.mode, url: config.url };
}

/**
 * Evaluate the gate for a call that was just assigned (inside the call transaction)
 * and create the PENDING assignment when flagged. Inert (no SurveyAssignment
 * access) when the feature is disabled.
 */
export async function evaluateSurveyForCall(tx, { turnId, userId, now = new Date() }) {
  const config = await getSurveyConfig(tx);
  const base = { surveyRequired: false, surveyAssignmentId: null, surveyConfig: publicSurveyConfig(config) };
  if (!config.enabled) return base;

  const workDate = workDateFor(now);
  const { start, end } = workDateBounds(workDate);

  const [callsToday, assignmentsToday] = await Promise.all([
    tx.turnRequest.count({
      where: {
        attendedBy: userId,
        status: { in: ['In Progress', 'Attended'] },
        calledAt: { gte: start, lt: end }
      }
    }),
    tx.surveyAssignment.findMany({
      where: { userId, workDate, turnId: { not: turnId } },
      orderBy: { createdAt: 'asc' },
      select: { status: true }
    })
  ]);

  const { flag } = shouldFlagTurn({ config, callsToday, assignmentsToday, userId, workDate });
  if (!flag) return base;

  const assignment = await tx.surveyAssignment.upsert({
    where: { turnId },
    update: {},
    create: { turnId, userId, workDate, mode: config.mode, status: 'PENDING' }
  });
  return { ...base, surveyRequired: assignment.status === 'PENDING', surveyAssignmentId: assignment.id };
}

export function clientIp(request) {
  return request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
}

export function writeAudit(client, { request, ...fields }) {
  const data = buildAuditLogData({ ...fields, ipAddress: request ? clientIp(request) : undefined });
  return client.auditLog.create({ data });
}

/**
 * Verify the Bearer JWT. Returns `{ decoded }` or `{ error: { status, message } }`.
 */
export function authenticateBearer(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: { status: 401, message: 'No autorizado' } };
  }
  try {
    const decoded = jwt.verify(authHeader.substring(7), process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET);
    if (!decoded?.userId) return { error: { status: 401, message: 'Token inválido' } };
    return { decoded };
  } catch {
    return { error: { status: 401, message: 'Token inválido' } };
  }
}

export function isAdminToken(decoded) {
  return isUserAdmin({ role: decoded?.role });
}

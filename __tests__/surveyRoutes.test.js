/**
 * Route-level tests for the survey gate (prisma mocked, real handlers, real JWTs).
 */

const mockPrisma = {
  systemState: { findUnique: jest.fn(), upsert: jest.fn() },
  surveyAssignment: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn()
  },
  turnRequest: { findUnique: jest.fn(), update: jest.fn() },
  auditLog: { create: jest.fn() },
  $queryRaw: jest.fn()
};

jest.mock('../lib/prisma.js', () => ({ __esModule: true, default: mockPrisma }));
jest.mock('../lib/sessionActivity.js', () => ({ touchSessionActivity: jest.fn().mockResolvedValue(undefined) }));
jest.mock('../lib/holdingUtils.js', () => ({ assignNextHolding: jest.fn().mockResolvedValue(null) }));

process.env.NEXTAUTH_SECRET = 'test-secret';
const jwt = require('jsonwebtoken');

const { POST: completePOST } = require('../src/app/api/attention/complete/route.js');
const { POST: deferPOST } = require('../src/app/api/queue/defer/route.js');
const { POST: forceCompletePOST } = require('../src/app/api/admin/force-complete/route.js');
const { POST: resolvePOST } = require('../src/app/api/surveys/resolve/route.js');
const { GET: reportGET } = require('../src/app/api/surveys/report/route.js');
const { POST: configPOST } = require('../src/app/api/admin/survey-config/route.js');

const token = (payload) => jwt.sign(payload, 'test-secret');
const OWNER = token({ userId: 7, role: 'Flebotomista' });
const OTHER = token({ userId: 8, role: 'Flebotomista' });
const ADMIN = token({ userId: 1, role: 'admin' });
const SUPERVISOR = token({ userId: 2, role: 'Supervisor' });

const req = (url, { method = 'POST', body, auth, raw } = {}) =>
  new Request(`http://localhost${url}`, {
    method,
    headers: { 'content-type': 'application/json', ...(auth ? { authorization: `Bearer ${auth}` } : {}) },
    body: raw !== undefined ? raw : body !== undefined ? JSON.stringify(body) : undefined
  });

const enabledConfig = (over = {}) => ({ value: JSON.stringify({ enabled: true, ...over }) });

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockPrisma.systemState.findUnique.mockResolvedValue(null);
  mockPrisma.auditLog.create.mockResolvedValue({});
});

afterEach(() => jest.restoreAllMocks());

describe('attention/complete', () => {
  beforeEach(() => {
    mockPrisma.turnRequest.findUnique.mockResolvedValue({ id: 5, attendedBy: 7, patientName: 'P' });
    mockPrisma.turnRequest.update.mockResolvedValue({ id: 5, status: 'Attended' });
  });

  test('PENDING survey + enabled -> 409 SURVEY_REQUIRED and the turn is not updated', async () => {
    mockPrisma.systemState.findUnique.mockResolvedValue(enabledConfig());
    mockPrisma.surveyAssignment.findUnique.mockResolvedValue({ id: 3, status: 'PENDING' });
    const res = await completePOST(req('/api/attention/complete', { body: { turnId: 5, userId: 7 } }));
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ code: 'SURVEY_REQUIRED', assignmentId: 3 });
    expect(mockPrisma.turnRequest.update).not.toHaveBeenCalled();
  });

  test('PENDING survey but feature disabled -> 200', async () => {
    mockPrisma.surveyAssignment.findUnique.mockResolvedValue({ id: 3, status: 'PENDING' });
    const res = await completePOST(req('/api/attention/complete', { body: { turnId: 5, userId: 7 } }));
    expect(res.status).toBe(200);
    expect(mockPrisma.surveyAssignment.findUnique).not.toHaveBeenCalled();
  });

  test.each(['COMPLETED', 'REFUSED', 'RELEASED', 'ADMIN_BYPASS'])('enabled + %s survey -> 200', async (status) => {
    mockPrisma.systemState.findUnique.mockResolvedValue(enabledConfig());
    mockPrisma.surveyAssignment.findUnique.mockResolvedValue({ id: 3, status });
    const res = await completePOST(req('/api/attention/complete', { body: { turnId: 5, userId: 7 } }));
    expect(res.status).toBe(200);
  });

  test('enabled + no assignment -> 200', async () => {
    mockPrisma.systemState.findUnique.mockResolvedValue(enabledConfig());
    mockPrisma.surveyAssignment.findUnique.mockResolvedValue(null);
    const res = await completePOST(req('/api/attention/complete', { body: { turnId: 5, userId: 7 } }));
    expect(res.status).toBe(200);
  });
});

describe('queue/defer', () => {
  beforeEach(() => {
    mockPrisma.turnRequest.findUnique.mockResolvedValue({
      id: 5, callCount: 2, status: 'In Progress', patientName: 'P', tipoAtencion: 'General',
      createdAt: new Date(), attendedBy: 7
    });
    mockPrisma.$queryRaw.mockResolvedValue([]);
    mockPrisma.turnRequest.update.mockResolvedValue({ id: 5, status: 'Pending' });
  });

  test('PENDING survey -> RELEASED and audited', async () => {
    mockPrisma.surveyAssignment.findUnique.mockResolvedValue({ id: 3, status: 'PENDING' });
    const res = await deferPOST(req('/api/queue/defer', { body: { turnId: 5 } }));
    expect(res.status).toBe(200);
    expect(mockPrisma.surveyAssignment.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 3 }, data: expect.objectContaining({ status: 'RELEASED' }) })
    );
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });

  test('non-PENDING survey is left untouched', async () => {
    mockPrisma.surveyAssignment.findUnique.mockResolvedValue({ id: 3, status: 'COMPLETED' });
    const res = await deferPOST(req('/api/queue/defer', { body: { turnId: 5 } }));
    expect(res.status).toBe(200);
    expect(mockPrisma.surveyAssignment.update).not.toHaveBeenCalled();
  });

  test('survey failure never blocks the defer', async () => {
    mockPrisma.surveyAssignment.findUnique.mockRejectedValue(new Error('db down'));
    const res = await deferPOST(req('/api/queue/defer', { body: { turnId: 5 } }));
    expect(res.status).toBe(200);
  });
});

describe('admin/force-complete', () => {
  beforeEach(() => {
    mockPrisma.turnRequest.findUnique.mockResolvedValue({
      id: 5, status: 'In Progress', attendedBy: 7, assignedTurn: 12, patientName: 'P'
    });
    mockPrisma.turnRequest.update.mockResolvedValue({ id: 5, status: 'Attended' });
  });

  test('PENDING survey -> ADMIN_BYPASS', async () => {
    mockPrisma.surveyAssignment.findUnique.mockResolvedValue({ id: 3, status: 'PENDING' });
    const res = await forceCompletePOST(
      req('/api/admin/force-complete', { body: { turnId: 5, reason: 'paciente se fue' }, auth: ADMIN })
    );
    expect(res.status).toBe(200);
    expect(mockPrisma.surveyAssignment.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 3 }, data: expect.objectContaining({ status: 'ADMIN_BYPASS', resolvedBy: 1 }) })
    );
  });

  test('COMPLETED survey is not changed', async () => {
    mockPrisma.surveyAssignment.findUnique.mockResolvedValue({ id: 3, status: 'COMPLETED' });
    const res = await forceCompletePOST(
      req('/api/admin/force-complete', { body: { turnId: 5, reason: 'paciente se fue' }, auth: ADMIN })
    );
    expect(res.status).toBe(200);
    expect(mockPrisma.surveyAssignment.update).not.toHaveBeenCalled();
  });
});

describe('surveys/resolve', () => {
  const assignment = (over = {}) => ({ id: 3, userId: 7, status: 'PENDING', turn: { attendedBy: 7 }, ...over });
  const post = (body, auth = OWNER, raw) => resolvePOST(req('/api/surveys/resolve', { body, auth, raw }));

  test('no token -> 401', async () => {
    const res = await post({ turnId: 5, outcome: 'COMPLETED' }, null);
    expect(res.status).toBe(401);
  });

  test('owner COMPLETED -> 200', async () => {
    mockPrisma.surveyAssignment.findUnique.mockResolvedValue(assignment());
    mockPrisma.surveyAssignment.updateMany.mockResolvedValue({ count: 1 });
    const res = await post({ turnId: 5, outcome: 'COMPLETED', iframeLoads: 2 });
    expect(res.status).toBe(200);
    expect(mockPrisma.surveyAssignment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 3, status: 'PENDING' }, data: expect.objectContaining({ status: 'COMPLETED', iframeLoads: 2 }) })
    );
  });

  test('REFUSED without reason -> 400', async () => {
    const res = await post({ turnId: 5, outcome: 'REFUSED' });
    expect(res.status).toBe(400);
    expect(mockPrisma.surveyAssignment.updateMany).not.toHaveBeenCalled();
  });

  test('REFUSED with reason -> 200 and reason stored', async () => {
    mockPrisma.surveyAssignment.findUnique.mockResolvedValue(assignment());
    mockPrisma.surveyAssignment.updateMany.mockResolvedValue({ count: 1 });
    const res = await post({ turnId: 5, outcome: 'REFUSED', reason: 'no quiso' });
    expect(res.status).toBe(200);
    expect(mockPrisma.surveyAssignment.updateMany.mock.calls[0][0].data).toMatchObject({
      status: 'REFUSED', refusalReason: 'no quiso'
    });
  });

  test('non-PENDING -> 409 SURVEY_NOT_PENDING', async () => {
    mockPrisma.surveyAssignment.findUnique.mockResolvedValue(assignment({ status: 'COMPLETED' }));
    mockPrisma.surveyAssignment.updateMany.mockResolvedValue({ count: 0 });
    const res = await post({ turnId: 5, outcome: 'COMPLETED' });
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ code: 'SURVEY_NOT_PENDING' });
  });

  test('non-owner non-admin -> 403', async () => {
    mockPrisma.surveyAssignment.findUnique.mockResolvedValue(assignment());
    const res = await post({ turnId: 5, outcome: 'COMPLETED' }, OTHER);
    expect(res.status).toBe(403);
    expect(mockPrisma.surveyAssignment.updateMany).not.toHaveBeenCalled();
  });

  test('admin may resolve for someone else', async () => {
    mockPrisma.surveyAssignment.findUnique.mockResolvedValue(assignment());
    mockPrisma.surveyAssignment.updateMany.mockResolvedValue({ count: 1 });
    const res = await post({ turnId: 5, outcome: 'COMPLETED' }, ADMIN);
    expect(res.status).toBe(200);
  });

  test('no assignment -> 404', async () => {
    mockPrisma.surveyAssignment.findUnique.mockResolvedValue(null);
    const res = await post({ turnId: 5, outcome: 'COMPLETED' });
    expect(res.status).toBe(404);
  });

  test.each([['malformed JSON', undefined, '{not json'], ['null body', undefined, 'null'], ['empty body', undefined, '']])(
    '%s -> 400',
    async (_n, body, raw) => {
      const res = await post(body, OWNER, raw);
      expect(res.status).toBe(400);
    }
  );
});

describe('admin/survey-config POST', () => {
  const post = (body, auth = ADMIN, raw) => configPOST(req('/api/admin/survey-config', { body, auth, raw }));

  test('non-admin -> 403', async () => {
    expect((await post({ enabled: true }, OWNER)).status).toBe(403);
  });

  test('supervisor cannot write config -> 403', async () => {
    expect((await post({ enabled: true }, SUPERVISOR)).status).toBe(403);
  });

  test('bad mode -> 400', async () => {
    expect((await post({ mode: 'popup' })).status).toBe(400);
  });

  test.each([['malformed JSON', '{oops'], ['null body', 'null']])('%s -> 400', async (_n, raw) => {
    expect((await post(undefined, ADMIN, raw)).status).toBe(400);
  });

  test('valid patch -> 200 and persisted merged config', async () => {
    mockPrisma.systemState.upsert.mockResolvedValue({});
    const res = await post({ enabled: true, windowMax: 3 });
    expect(res.status).toBe(200);
    const saved = JSON.parse(mockPrisma.systemState.upsert.mock.calls[0][0].update.value);
    expect(saved).toMatchObject({ enabled: true, windowMax: 3 });
  });
});

describe('surveys/report GET', () => {
  const get = (qs, auth = ADMIN) => reportGET(req(`/api/surveys/report${qs}`, { method: 'GET', auth }));

  beforeEach(() => mockPrisma.surveyAssignment.findMany.mockResolvedValue([]));

  test.each([['admin', ADMIN], ['supervisor', SUPERVISOR]])('%s allowed', async (_n, t) => {
    expect((await get('?from=2026-03-01&to=2026-03-02', t)).status).toBe(200);
  });

  test('phlebotomist -> 403', async () => {
    expect((await get('?from=2026-03-01&to=2026-03-02', OWNER)).status).toBe(403);
  });

  test.each(['?from=2026-02-31&to=2026-03-02', '?from=2026-13-01&to=2026-13-02', '?from=2026-03-05&to=2026-03-01'])(
    'impossible/inverted range %s -> 400',
    async (qs) => {
      expect((await get(qs)).status).toBe(400);
    }
  );

  test('range over 93 days -> 400, exactly 93 days -> 200', async () => {
    expect((await get('?from=2026-01-01&to=2026-04-04')).status).toBe(400); // 94 days
    expect((await get('?from=2026-01-01&to=2026-04-03')).status).toBe(200); // 93 days
  });
});

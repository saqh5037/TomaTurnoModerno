/**
 * Regression 2026-11-09 (v2.8.64) - empty cubicle dropdown in the attention panel.
 *
 * /api/cubicles/status created its own PrismaClient and called $disconnect()
 * in a finally block on every request. Polling every 5 s from each tablet made
 * a disconnect race concurrent queries and left the engine stuck in
 * "Engine is not yet connected"; the rejected $disconnect() then replaced the
 * JSON response with an empty HTTP 500.
 *
 * Guarantees: the route uses the shared singleton, never disconnects, and
 * always answers with a JSON body, even on failure.
 */

const mockPrivateClient = {
  cubicle: { findMany: jest.fn() },
  session: { findMany: jest.fn() },
  $disconnect: jest.fn(),
};

const mockSharedClient = {
  cubicle: { findMany: jest.fn() },
  session: { findMany: jest.fn() },
  $disconnect: jest.fn(),
};

const mockCleanupCubicles = jest.fn();

jest.mock('@prisma/client', () => ({
  __esModule: true,
  PrismaClient: jest.fn(() => mockPrivateClient),
}));

jest.mock('../../lib/prisma.js', () => ({
  __esModule: true,
  default: mockSharedClient,
}));

jest.mock('../../lib/cubicleCleanup.js', () => ({
  __esModule: true,
  cleanupCubicles: (...args) => mockCleanupCubicles(...args),
}));

const { PrismaClient } = require('@prisma/client');
const { GET } = require('../../src/app/api/cubicles/status/route.js');

// The old route built its client at module load, before any beforeEach runs.
const clientsCreatedAtImport = PrismaClient.mock.calls.length;

const CUBICLES = [
  { id: 1, name: 'Cubiculo 1', type: 'GENERAL', isSpecial: false, isActive: true },
  { id: 2, name: 'Cubiculo 2', type: 'GENERAL', isSpecial: false, isActive: true },
  { id: 3, name: 'Cubiculo 3', type: 'SPECIAL', isSpecial: true, isActive: true },
];

const SESSIONS = [
  {
    id: 'sess-1',
    userId: 42,
    selectedCubicleId: 2,
    lastActivity: new Date(),
    user: { id: 42, name: 'Flebo Uno', role: 'Flebotomista' },
  },
];

describe('GET /api/cubicles/status - shared Prisma client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockCleanupCubicles.mockResolvedValue({ expired: 0, inactive: 0 });
    mockSharedClient.cubicle.findMany.mockResolvedValue(CUBICLES);
    mockSharedClient.session.findMany.mockResolvedValue(SESSIONS);
    mockPrivateClient.cubicle.findMany.mockResolvedValue(CUBICLES);
    mockPrivateClient.session.findMany.mockResolvedValue(SESSIONS);
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('returns 200 with occupancy computed from active sessions', async () => {
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(3);

    const byId = Object.fromEntries(body.data.map((c) => [c.id, c]));
    expect(byId[2].isOccupied).toBe(true);
    expect(byId[2].occupiedBy.userId).toBe(42);
    expect(byId[1].isOccupied).toBe(false);
    expect(byId[3].isOccupied).toBe(false);
  });

  test('never instantiates its own PrismaClient', async () => {
    await GET();

    expect(clientsCreatedAtImport).toBe(0);
    expect(PrismaClient).not.toHaveBeenCalled();
  });

  test('never calls $disconnect on any client', async () => {
    await GET();

    expect(mockSharedClient.$disconnect).not.toHaveBeenCalled();
    expect(mockPrivateClient.$disconnect).not.toHaveBeenCalled();
  });

  test('returns a JSON 500 body (never empty) when the engine is not connected', async () => {
    const engineError = new Error('{"message":"Engine is not yet connected."}');
    mockSharedClient.cubicle.findMany.mockRejectedValue(engineError);
    mockPrivateClient.cubicle.findMany.mockRejectedValue(engineError);
    // Old code: $disconnect() in finally rejected and overrode the response.
    mockPrivateClient.$disconnect.mockRejectedValue(engineError);
    mockSharedClient.$disconnect.mockRejectedValue(engineError);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(typeof body.error).toBe('string');
  });
});

/**
 * Tests for lib/cubicleCleanup.js — releaseInactiveCubicles In-Progress guard
 *
 * Covers:
 *  - User with a turn 'In Progress' is EXCLUDED from the session.updateMany
 *    (their cubicle is NOT released, even if lastActivity is stale).
 *  - User WITHOUT an 'In Progress' turn and with stale lastActivity IS included
 *    in the updateMany (their cubicle IS released).
 *  - TurnRequest.findMany is called with status 'In Progress' to detect active
 *    phlebotomists before issuing the cleanup.
 *  - When no one is attending, the notIn clause uses [-1] sentinel to keep the
 *    query valid while excluding no real user.
 */

const mockPrisma = {
  turnRequest: {
    findMany: jest.fn(),
  },
  session: {
    updateMany: jest.fn(),
  },
};

jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: mockPrisma,
}));

const { releaseInactiveCubicles } = require('../lib/cubicleCleanup.js');

describe('releaseInactiveCubicles — In-Progress guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.session.updateMany.mockResolvedValue({ count: 0 });
  });

  test('queries TurnRequest for In-Progress turns before running updateMany', async () => {
    mockPrisma.turnRequest.findMany.mockResolvedValue([]);

    await releaseInactiveCubicles();

    expect(mockPrisma.turnRequest.findMany).toHaveBeenCalledTimes(1);
    const findArgs = mockPrisma.turnRequest.findMany.mock.calls[0][0];
    expect(findArgs.where.status).toBe('In Progress');
    expect(findArgs.where.attendedBy).toEqual({ not: null });
  });

  test('user attending (In Progress) is excluded via notIn — cubicle NOT released', async () => {
    // User 7 is currently attending a patient
    mockPrisma.turnRequest.findMany.mockResolvedValue([
      { attendedBy: 7 },
    ]);

    await releaseInactiveCubicles();

    const updateArgs = mockPrisma.session.updateMany.mock.calls[0][0];
    expect(updateArgs.where.userId).toEqual({ notIn: [7] });
  });

  test('user NOT attending and lastActivity stale — IS included in the release', async () => {
    // No one is attending
    mockPrisma.turnRequest.findMany.mockResolvedValue([]);

    await releaseInactiveCubicles();

    const updateArgs = mockPrisma.session.updateMany.mock.calls[0][0];
    // Sentinel [-1]: nobody excluded → any stale session can be released
    expect(updateArgs.where.userId).toEqual({ notIn: [-1] });
  });

  test('multiple attending users — all are excluded from updateMany', async () => {
    mockPrisma.turnRequest.findMany.mockResolvedValue([
      { attendedBy: 3 },
      { attendedBy: 5 },
      { attendedBy: 11 },
    ]);

    await releaseInactiveCubicles();

    const updateArgs = mockPrisma.session.updateMany.mock.calls[0][0];
    expect(updateArgs.where.userId).toEqual({ notIn: [3, 5, 11] });
  });

  test('updateMany WHERE includes inactivity threshold and selectedCubicleId check', async () => {
    mockPrisma.turnRequest.findMany.mockResolvedValue([]);

    const before = new Date();
    await releaseInactiveCubicles();
    const after = new Date();

    const updateArgs = mockPrisma.session.updateMany.mock.calls[0][0];

    // lastActivity must be older than the threshold (~20 min ago)
    expect(updateArgs.where.lastActivity).toHaveProperty('lt');
    const threshold = updateArgs.where.lastActivity.lt;
    expect(threshold).toBeInstanceOf(Date);
    // threshold should be ~20 min before "now"
    const TWENTY_MIN_MS = 20 * 60 * 1000;
    expect(threshold.getTime()).toBeLessThanOrEqual(before.getTime() - TWENTY_MIN_MS + 100);
    expect(threshold.getTime()).toBeGreaterThanOrEqual(after.getTime() - TWENTY_MIN_MS - 100);

    // Only sessions that currently have a cubicle assigned
    expect(updateArgs.where.selectedCubicleId).toEqual({ not: null });

    // The release nulls out selectedCubicleId
    expect(updateArgs.data).toEqual({ selectedCubicleId: null });
  });

  test('returns count from session.updateMany', async () => {
    mockPrisma.turnRequest.findMany.mockResolvedValue([]);
    mockPrisma.session.updateMany.mockResolvedValue({ count: 4 });

    const result = await releaseInactiveCubicles();
    expect(result).toBe(4);
  });
});

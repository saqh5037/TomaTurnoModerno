/**
 * Tests for lib/sessionActivity.js — touchSessionActivity
 *
 * Covers:
 *  - Valid userId: calls session.updateMany with lastActivity bumped
 *  - null userId: no-op, returns 0
 *  - NaN userId (e.g. "abc"): no-op, returns 0
 *  - 0 userId: no-op, returns 0
 *  - undefined userId: no-op, returns 0
 */

const mockPrisma = {
  session: {
    updateMany: jest.fn(),
  },
};

jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: mockPrisma,
}));

const { touchSessionActivity } = require('../lib/sessionActivity.js');

describe('touchSessionActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('valid userId — calls session.updateMany with lastActivity', async () => {
    mockPrisma.session.updateMany.mockResolvedValue({ count: 1 });
    const before = new Date();

    const result = await touchSessionActivity(42);

    expect(mockPrisma.session.updateMany).toHaveBeenCalledTimes(1);

    const callArgs = mockPrisma.session.updateMany.mock.calls[0][0];

    // WHERE clause targets the right user and only non-expired sessions
    expect(callArgs.where.userId).toBe(42);
    expect(callArgs.where.expiresAt).toEqual({ gt: expect.any(Date) });

    // DATA sets lastActivity to a date >= before the call
    expect(callArgs.data.lastActivity).toBeInstanceOf(Date);
    expect(callArgs.data.lastActivity.getTime()).toBeGreaterThanOrEqual(before.getTime());

    expect(result).toBe(1);
  });

  test('userId as string "42" — parses correctly and updates', async () => {
    mockPrisma.session.updateMany.mockResolvedValue({ count: 1 });

    await touchSessionActivity('42');

    const callArgs = mockPrisma.session.updateMany.mock.calls[0][0];
    expect(callArgs.where.userId).toBe(42);
  });

  test('null userId — no-op, updateMany never called, returns 0', async () => {
    const result = await touchSessionActivity(null);

    expect(mockPrisma.session.updateMany).not.toHaveBeenCalled();
    expect(result).toBe(0);
  });

  test('undefined userId — no-op, returns 0', async () => {
    const result = await touchSessionActivity(undefined);

    expect(mockPrisma.session.updateMany).not.toHaveBeenCalled();
    expect(result).toBe(0);
  });

  test('non-numeric string userId ("abc") — no-op, returns 0', async () => {
    const result = await touchSessionActivity('abc');

    expect(mockPrisma.session.updateMany).not.toHaveBeenCalled();
    expect(result).toBe(0);
  });

  test('userId 0 — no-op (falsy), returns 0', async () => {
    const result = await touchSessionActivity(0);

    expect(mockPrisma.session.updateMany).not.toHaveBeenCalled();
    expect(result).toBe(0);
  });
});

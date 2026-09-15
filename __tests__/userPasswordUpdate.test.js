/**
 * Tests for lib/userPasswordUpdate.js
 *
 * Bug context (v2.8.63): PUT /api/users/[id] let an admin set a brand new
 * password for a user but never cleared failedAttempts/lockedUntil. A locked
 * user given a fresh password by an admin stayed locked out for up to
 * 30 minutes with no way to log in, even though they now had a valid
 * credential.
 */

import bcrypt from 'bcryptjs';
import { buildPasswordUpdateData } from '../lib/userPasswordUpdate.js';

describe('buildPasswordUpdateData — lockout-not-cleared bug', () => {
  test('RED (documents the bug): a naive update object does not clear the lockout', () => {
    // Reproduces the OLD PUT route's updateData shape for a password change.
    const oldStyleUpdateData = {
      password: 'irrelevant-hash',
      passwordChangedAt: new Date(),
    };
    expect(oldStyleUpdateData.failedAttempts).toBeUndefined();
    expect(oldStyleUpdateData.lockedUntil).toBeUndefined();
  });

  test('GREEN: the real helper always clears failedAttempts and lockedUntil', async () => {
    const data = await buildPasswordUpdateData('Abcdefg1');
    expect(data.failedAttempts).toBe(0);
    expect(data.lockedUntil).toBeNull();
  });
});

describe('buildPasswordUpdateData', () => {
  test('hashes the password so bcrypt.compare succeeds against the original', async () => {
    const plain = 'MySecure1Pass';
    const data = await buildPasswordUpdateData(plain);
    expect(data.password).not.toBe(plain);
    const matches = await bcrypt.compare(plain, data.password);
    expect(matches).toBe(true);
  });

  test('sets passwordChangedAt to a Date', async () => {
    const data = await buildPasswordUpdateData('Abcdefg1');
    expect(data.passwordChangedAt).toBeInstanceOf(Date);
  });

  test('rejects a password that fails the shared policy', async () => {
    await expect(buildPasswordUpdateData('short')).rejects.toThrow();
  });
});

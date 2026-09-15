/**
 * Tests for lib/passwordPolicy.js
 *
 * Bug context (v2.8.63): the client-side validateForm() in
 * pages/users/index.js only checked password.length >= 8, while the
 * server (PUT /api/users/[id]) required a stricter regex (upper+lower+digit).
 * An admin could submit an "OK" password client-side that the server
 * silently rejected with a generic error, and there was no reuse of the
 * validation logic between client and server.
 */

import { validatePassword, PASSWORD_REGEX, PASSWORD_POLICY_MESSAGE } from '../lib/passwordPolicy.js';

// Reproduces the OLD client-only check that caused the client/server mismatch.
function oldClientCheck(password) {
  return Boolean(password) && password.length >= 8;
}

describe('passwordPolicy — client/server mismatch bug', () => {
  test('RED (documents the bug): old client check accepted an all-lowercase 8-char password', () => {
    const password = 'aaaaaaaa';
    expect(oldClientCheck(password)).toBe(true); // old client said "valid"
    expect(validatePassword(password).valid).toBe(false); // server always rejected it
  });

  test('GREEN: shared validator now rejects the same password on both sides', () => {
    expect(validatePassword('aaaaaaaa').valid).toBe(false);
  });
});

describe('validatePassword', () => {
  test.each([
    'Abcdefg1',
    'P@ssw0rd',
    'Aa1aaaaaaaaa',
  ])('accepts a valid password: %s', (password) => {
    const result = validatePassword(password);
    expect(result.valid).toBe(true);
    expect(result.message).toBeNull();
  });

  test.each([
    ['', 'empty'],
    [null, 'null'],
    [undefined, 'undefined'],
    ['short1A', 'too short'],
    ['alllowercase1', 'no uppercase'],
    ['ALLUPPERCASE1', 'no lowercase'],
    ['NoDigitsHere', 'no digit'],
  ])('rejects an invalid password (%s): %s', (password) => {
    const result = validatePassword(password);
    expect(result.valid).toBe(false);
    expect(result.message).toBe(PASSWORD_POLICY_MESSAGE);
  });

  test('regex is exported and matches the validator behavior', () => {
    expect(PASSWORD_REGEX.test('Abcdefg1')).toBe(true);
    expect(PASSWORD_REGEX.test('short')).toBe(false);
  });
});

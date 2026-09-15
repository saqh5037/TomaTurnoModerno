/**
 * Tests for lib/temporaryPassword.js
 *
 * Bug context (v2.8.63): the reset-password route's generateRandomPassword()
 * used Math.random() (not crypto-safe) over a charset that included
 * ambiguous characters (0/O, 1/l/I) and `^`, a dead key on Latin American
 * keyboards. Support staff had to read the password aloud over the phone
 * and users mistyped it or could not type it at all.
 */

import { generateTemporaryPassword } from '../lib/temporaryPassword.js';
import { validatePassword } from '../lib/passwordPolicy.js';

const AMBIGUOUS_CHARS = ['0', 'O', 'o', '1', 'l', 'I', 'i'];
const HARD_TO_TYPE_SYMBOLS = ['^', '~', '`'];

// Reproduces the OLD charset/algorithm shape (Math.random, ambiguous chars).
function oldGenerateRandomPassword() {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

describe('temporaryPassword — ambiguous character bug', () => {
  test('RED (documents the bug): old generator could and did produce ambiguous characters', () => {
    // Force a scenario that is statistically certain over enough samples.
    const samples = Array.from({ length: 500 }, () => oldGenerateRandomPassword());
    const hadAmbiguous = samples.some((pwd) =>
      AMBIGUOUS_CHARS.some((c) => pwd.includes(c)) || pwd.includes('^')
    );
    expect(hadAmbiguous).toBe(true);
  });

  test('GREEN: new generator never produces ambiguous or hard-to-type characters', () => {
    const samples = Array.from({ length: 2000 }, () => generateTemporaryPassword());
    for (const pwd of samples) {
      for (const c of AMBIGUOUS_CHARS) {
        expect(pwd.includes(c)).toBe(false);
      }
      for (const c of HARD_TO_TYPE_SYMBOLS) {
        expect(pwd.includes(c)).toBe(false);
      }
    }
  });
});

describe('generateTemporaryPassword', () => {
  test('always generates a 12-character password', () => {
    for (let i = 0; i < 200; i++) {
      expect(generateTemporaryPassword()).toHaveLength(12);
    }
  });

  test('always satisfies the shared password policy', () => {
    for (let i = 0; i < 2000; i++) {
      const pwd = generateTemporaryPassword();
      expect(validatePassword(pwd).valid).toBe(true);
    }
  });

  test('always contains at least one uppercase, lowercase, digit and symbol', () => {
    for (let i = 0; i < 500; i++) {
      const pwd = generateTemporaryPassword();
      expect(pwd).toMatch(/[A-Z]/);
      expect(pwd).toMatch(/[a-z]/);
      expect(pwd).toMatch(/[0-9]/);
      expect(pwd).toMatch(/[!#$%*+?]/);
    }
  });

  test('generates different passwords across calls (not deterministic)', () => {
    const samples = new Set(Array.from({ length: 50 }, () => generateTemporaryPassword()));
    expect(samples.size).toBeGreaterThan(1);
  });
});

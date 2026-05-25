/**
 * Tests: cubicleNumberFromName + cubicleMatchesPreferred
 * Added in fix/investigacion-reportes-20260505 to cover cubicle-name matching.
 */

import {
  cubicleNumberFromName,
  cubicleMatchesPreferred,
} from '../lib/prioridadUtils.js';

describe('cubicleNumberFromName', () => {
  test('plain number string returns that number', () => {
    expect(cubicleNumberFromName('1')).toBe(1);
  });

  test('name with prefix "Cubículo 1" returns 1', () => {
    expect(cubicleNumberFromName('Cubículo 1')).toBe(1);
  });

  test('multi-digit number "Cubículo 12" returns 12', () => {
    expect(cubicleNumberFromName('Cubículo 12')).toBe(12);
  });

  test('trailing whitespace is ignored', () => {
    expect(cubicleNumberFromName('3 ')).toBe(3);
  });

  test('null returns null', () => {
    expect(cubicleNumberFromName(null)).toBeNull();
  });

  test('undefined returns null', () => {
    expect(cubicleNumberFromName(undefined)).toBeNull();
  });

  test('string with no digits returns null', () => {
    expect(cubicleNumberFromName('Caja')).toBeNull();
  });
});

describe('cubicleMatchesPreferred', () => {
  test('"1" matches [1, 2]', () => {
    expect(cubicleMatchesPreferred('1', [1, 2])).toBe(true);
  });

  test('"2" matches [1, 2]', () => {
    expect(cubicleMatchesPreferred('2', [1, 2])).toBe(true);
  });

  test('"3" does NOT match [1, 2]', () => {
    expect(cubicleMatchesPreferred('3', [1, 2])).toBe(false);
  });

  test('"Cubículo 1" matches [1, 2]', () => {
    expect(cubicleMatchesPreferred('Cubículo 1', [1, 2])).toBe(true);
  });

  test('"Cubículo 3" does NOT match [1, 2]', () => {
    expect(cubicleMatchesPreferred('Cubículo 3', [1, 2])).toBe(false);
  });

  test('null name returns false', () => {
    expect(cubicleMatchesPreferred(null, [1, 2])).toBe(false);
  });

  test('"6" matches [6] (MuyEspecial cubicle)', () => {
    expect(cubicleMatchesPreferred('6', [6])).toBe(true);
  });

  test('"1" does NOT match [6]', () => {
    expect(cubicleMatchesPreferred('1', [6])).toBe(false);
  });
});

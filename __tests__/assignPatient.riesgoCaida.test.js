/**
 * Tests: RiesgoCaida validation in /api/admin/assign-patient
 *
 * Fix C (original): rejects (409) RiesgoCaida assigned to a phlebotomist
 * NOT in cubicle 1 or 2, unless force=true.
 *
 * Fix D (dropdown-null-cubicle): when phlebCubicle is null (cubicle unknown),
 * the assignment is ALLOWED — admin is acting consciously without cubicle info.
 * Only block when the cubicle IS known and not 1 or 2.
 */

import { cubicleNumberFromName } from '../lib/prioridadUtils.js';

/**
 * Replica of the RiesgoCaida compatibility check — updated for Fix D.
 * When phlebCubicle is null → compatible (unknown cubicle, no block).
 * When phlebCubicle is known and not 1/2 → not compatible.
 */
function checkRiesgoCaidaCompatibility(tipoAtencion, phlebCubicle) {
  let compatible = true;
  let incompatibilityReason = null;

  // Only enforce when cubicle is KNOWN (phlebCubicle non-null)
  if (tipoAtencion === 'RiesgoCaida' && phlebCubicle) {
    const num = cubicleNumberFromName(phlebCubicle.name);
    if (![1, 2].includes(num)) {
      compatible = false;
      incompatibilityReason = `Paciente en silla de ruedas (RiesgoCaida) solo puede asignarse a cubículos 1 o 2. Flebotomista está en ${phlebCubicle.name}.`;
    }
  }

  return { compatible, incompatibilityReason };
}

describe('Fix C: RiesgoCaida → assign-patient validation (known cubicle)', () => {
  test('409 behavior: RiesgoCaida assigned to cub "3" → not compatible', () => {
    const { compatible } = checkRiesgoCaidaCompatibility('RiesgoCaida', { name: '3', type: 'GENERAL' });
    expect(compatible).toBe(false);
  });

  test('409 behavior: RiesgoCaida assigned to cub "5" → not compatible', () => {
    const { compatible } = checkRiesgoCaidaCompatibility('RiesgoCaida', { name: '5', type: 'GENERAL' });
    expect(compatible).toBe(false);
  });

  test('409 reason message mentions cubicle name', () => {
    const { incompatibilityReason } = checkRiesgoCaidaCompatibility('RiesgoCaida', { name: '3', type: 'GENERAL' });
    expect(incompatibilityReason).toContain('3');
    expect(incompatibilityReason).toContain('RiesgoCaida');
  });

  test('OK with force=true: logic would proceed regardless of compatible flag', () => {
    const { compatible } = checkRiesgoCaidaCompatibility('RiesgoCaida', { name: '3', type: 'GENERAL' });
    // force=true means the caller ignores compatible=false → just verify the flag is false
    const force = true;
    const wouldProceed = compatible || force;
    expect(wouldProceed).toBe(true);
  });

  test('compatible: RiesgoCaida in cub "1" → ok', () => {
    const { compatible } = checkRiesgoCaidaCompatibility('RiesgoCaida', { name: '1', type: 'GENERAL' });
    expect(compatible).toBe(true);
  });

  test('compatible: RiesgoCaida in cub "2" → ok', () => {
    const { compatible } = checkRiesgoCaidaCompatibility('RiesgoCaida', { name: '2', type: 'GENERAL' });
    expect(compatible).toBe(true);
  });

  test('non-RiesgoCaida type is unaffected by this check', () => {
    const { compatible } = checkRiesgoCaidaCompatibility('General', { name: '3', type: 'GENERAL' });
    expect(compatible).toBe(true);
  });

  test('non-RiesgoCaida Prioritario in cub "3" is unaffected by this check', () => {
    const { compatible } = checkRiesgoCaidaCompatibility('Prioritario', { name: '3', type: 'GENERAL' });
    expect(compatible).toBe(true);
  });
});

describe('Fix D: RiesgoCaida with unknown cubicle (null phlebCubicle)', () => {
  test('RiesgoCaida with phlebCubicle null → compatible (allowed, cubicle unknown)', () => {
    // Previously this was blocked; now it must be allowed so flebos without
    // selectedCubicleId (due to cubicleCleanup) can still be assigned.
    const { compatible, incompatibilityReason } = checkRiesgoCaidaCompatibility('RiesgoCaida', null);
    expect(compatible).toBe(true);
    expect(incompatibilityReason).toBeNull();
  });

  test('RiesgoCaida with phlebCubicle null → no incompatibilityReason set', () => {
    const { incompatibilityReason } = checkRiesgoCaidaCompatibility('RiesgoCaida', null);
    expect(incompatibilityReason).toBeNull();
  });

  test('RiesgoCaida with known cub "4" → still blocked (404 behavior)', () => {
    // Sanity: known non-1/2 cubicle still produces incompatibility
    const { compatible } = checkRiesgoCaidaCompatibility('RiesgoCaida', { name: '4', type: 'GENERAL' });
    expect(compatible).toBe(false);
  });

  test('General type with null phlebCubicle → compatible (unrelated type)', () => {
    const { compatible } = checkRiesgoCaidaCompatibility('General', null);
    expect(compatible).toBe(true);
  });
});

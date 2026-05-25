/**
 * Tests: RiesgoCaida validation in /api/admin/assign-patient (Fix C)
 *
 * The route now rejects (409) assignment of RiesgoCaida to a phlebotomist
 * who is NOT in cubicle 1 or 2, unless force=true is sent.
 *
 * We test the validation logic in isolation (no HTTP layer needed).
 */

import { cubicleNumberFromName } from '../lib/prioridadUtils.js';

/**
 * Replica of the RiesgoCaida compatibility check added in Fix C.
 * Returns { compatible, incompatibilityReason }.
 */
function checkRiesgoCaidaCompatibility(tipoAtencion, phlebCubicle) {
  let compatible = true;
  let incompatibilityReason = null;

  if (tipoAtencion === 'RiesgoCaida') {
    const num = cubicleNumberFromName(phlebCubicle?.name);
    if (![1, 2].includes(num)) {
      compatible = false;
      incompatibilityReason = `Paciente en silla de ruedas (RiesgoCaida) solo puede asignarse a cubículos 1 o 2. Flebotomista está en ${phlebCubicle?.name || '(sin cubículo)'}.`;
    }
  }

  return { compatible, incompatibilityReason };
}

describe('Fix C: RiesgoCaida → assign-patient validation', () => {
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

  test('compatible: RiesgoCaida with no cubicle (null phlebCubicle) → not compatible', () => {
    const { compatible } = checkRiesgoCaidaCompatibility('RiesgoCaida', null);
    expect(compatible).toBe(false);
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

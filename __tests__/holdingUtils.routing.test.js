/**
 * Tests de regresión: routing SPECIAL/GENERAL en assignNextHolding.
 *
 * Historia:
 *   - v2.8.54: isEspecialTurn() rechazaba RiesgoCaida en cubs GENERAL (bug).
 *   - v2.8.55: requiresSpecialCubicle() solo MuyEspecial → SPECIAL.
 *   - v2.8.56: alineado al diagrama del docx — Prioritario también → SPECIAL,
 *              cub SPECIAL no atiende General si hay Prioritario/MuyEspecial
 *              esperando.
 *
 * Tests cubren la lógica pura sin tocar Prisma. La función real
 * assignNextHolding está acoplada a BD; aquí replicamos el filtro crítico.
 */

import { requiresSpecialCubicle, isEspecialTurn } from '../lib/prioridadUtils.js';

describe('requiresSpecialCubicle — regla de routing v2.8.56', () => {
  test('MuyEspecial requiere cubículo SPECIAL', () => {
    expect(requiresSpecialCubicle('MuyEspecial')).toBe(true);
  });

  test('Prioritario requiere SPECIAL (v2.8.56: alineado al diagrama)', () => {
    expect(requiresSpecialCubicle('Prioritario')).toBe(true);
  });

  test('RiesgoCaida NO requiere SPECIAL (va a cubs 1,2 GENERAL)', () => {
    expect(requiresSpecialCubicle('RiesgoCaida')).toBe(false);
  });

  test('PrioritarioRiesgo NO requiere SPECIAL (va a cubs 1,2 GENERAL)', () => {
    expect(requiresSpecialCubicle('PrioritarioRiesgo')).toBe(false);
  });

  test('General NO requiere SPECIAL', () => {
    expect(requiresSpecialCubicle('General')).toBe(false);
  });

  test('isEspecialTurn es alias de requiresSpecialCubicle (compat)', () => {
    expect(isEspecialTurn('MuyEspecial')).toBe(true);
    expect(isEspecialTurn('Prioritario')).toBe(true);
    expect(isEspecialTurn('RiesgoCaida')).toBe(false);
    expect(isEspecialTurn('General')).toBe(false);
  });
});

/**
 * Replica de la lógica de filtrado de assignNextHolding (lib/holdingUtils.js:217-258)
 * Aislada para testing sin BD.
 */
function selectTurnForCubicle(turns, cubicleType) {
  const hasSpecialVulnerablePending = turns.some(t => requiresSpecialCubicle(t.tipoAtencion));
  for (const turn of turns) {
    const needsSpecial = requiresSpecialCubicle(turn.tipoAtencion);
    if (cubicleType === 'GENERAL' && needsSpecial) continue;
    if (cubicleType === 'SPECIAL' && !needsSpecial && hasSpecialVulnerablePending) continue;
    return turn;
  }
  return null;
}

describe('Filtro de assignNextHolding — casos del bug reportado', () => {
  test('CASO 1 (bug reportado): RiesgoCaida en cola + cub GENERAL → asigna', () => {
    const turns = [
      { id: 16190, tipoAtencion: 'RiesgoCaida', assignedTurn: 16190 }
    ];
    const result = selectTurnForCubicle(turns, 'GENERAL');
    expect(result).not.toBeNull();
    expect(result.id).toBe(16190);
  });

  test('CASO 2: MuyEspecial en cola + cub GENERAL → NO asigna (debe esperar SPECIAL)', () => {
    const turns = [
      { id: 100, tipoAtencion: 'MuyEspecial', assignedTurn: 100 }
    ];
    const result = selectTurnForCubicle(turns, 'GENERAL');
    expect(result).toBeNull();
  });

  test('CASO 3: MuyEspecial + General mezclados + cub SPECIAL → asigna MuyEspecial primero', () => {
    const turns = [
      { id: 100, tipoAtencion: 'MuyEspecial', assignedTurn: 100 },
      { id: 101, tipoAtencion: 'General', assignedTurn: 101 }
    ];
    const result = selectTurnForCubicle(turns, 'SPECIAL');
    expect(result.id).toBe(100);
  });

  test('CASO 4: PrioritarioRiesgo en cola + cub GENERAL → asigna (va a 1,2 GENERAL)', () => {
    const turns = [
      { id: 200, tipoAtencion: 'PrioritarioRiesgo', assignedTurn: 200 }
    ];
    const result = selectTurnForCubicle(turns, 'GENERAL');
    expect(result).not.toBeNull();
    expect(result.id).toBe(200);
  });

  test('CASO 5: Solo General en cola + cub SPECIAL → asigna (sin Prioritario/MuyEspecial esperando)', () => {
    const turns = [
      { id: 300, tipoAtencion: 'General', assignedTurn: 300 }
    ];
    const result = selectTurnForCubicle(turns, 'SPECIAL');
    expect(result).not.toBeNull();
    expect(result.id).toBe(300);
  });

  test('CASO 6: MuyEspecial + RiesgoCaida + cub GENERAL → asigna RiesgoCaida (salta MuyEspecial)', () => {
    const turns = [
      { id: 100, tipoAtencion: 'MuyEspecial', assignedTurn: 100 },
      { id: 200, tipoAtencion: 'RiesgoCaida', assignedTurn: 200 }
    ];
    const result = selectTurnForCubicle(turns, 'GENERAL');
    expect(result).not.toBeNull();
    expect(result.id).toBe(200);
  });

  test('CASO 7: Cola vacía → null', () => {
    expect(selectTurnForCubicle([], 'GENERAL')).toBeNull();
    expect(selectTurnForCubicle([], 'SPECIAL')).toBeNull();
  });

  // === Casos nuevos v2.8.56 ===

  test('CASO 8 (v2.8.56): Prioritario en cola + cub GENERAL → NO asigna (debe ir a SPECIAL)', () => {
    const turns = [
      { id: 400, tipoAtencion: 'Prioritario', assignedTurn: 400 }
    ];
    const result = selectTurnForCubicle(turns, 'GENERAL');
    expect(result).toBeNull();
  });

  test('CASO 9 (v2.8.56): Prioritario en cola + cub SPECIAL → asigna', () => {
    const turns = [
      { id: 400, tipoAtencion: 'Prioritario', assignedTurn: 400 }
    ];
    const result = selectTurnForCubicle(turns, 'SPECIAL');
    expect(result).not.toBeNull();
    expect(result.id).toBe(400);
  });

  test('CASO 10 (v2.8.56): Prioritario + General + cub SPECIAL → toma Prioritario, no General', () => {
    const turns = [
      { id: 400, tipoAtencion: 'Prioritario', assignedTurn: 400 },
      { id: 401, tipoAtencion: 'General', assignedTurn: 401 }
    ];
    const result = selectTurnForCubicle(turns, 'SPECIAL');
    expect(result.id).toBe(400);
  });

  test('CASO 11 (v2.8.56): Prioritario + General + cub GENERAL → toma General (no Prioritario)', () => {
    const turns = [
      { id: 400, tipoAtencion: 'Prioritario', assignedTurn: 400 },
      { id: 401, tipoAtencion: 'General', assignedTurn: 401 }
    ];
    const result = selectTurnForCubicle(turns, 'GENERAL');
    expect(result.id).toBe(401);
  });

  test('CASO 12 (v2.8.56): General + RiesgoCaida + cub SPECIAL → toma General (RiesgoCaida no bloquea SPECIAL)', () => {
    // Bug evitado: si RiesgoCaida bloqueara SPECIAL, cub 6 quedaría inútil
    // cuando hay RiesgoCaida esperando (que va a cubs 1,2, no a SPECIAL).
    const turns = [
      { id: 500, tipoAtencion: 'General', assignedTurn: 500 },
      { id: 501, tipoAtencion: 'RiesgoCaida', assignedTurn: 501 }
    ];
    const result = selectTurnForCubicle(turns, 'SPECIAL');
    expect(result).not.toBeNull();
    expect(result.id).toBe(500);
  });

  test('CASO 13 (v2.8.56): solo General y solo cub SPECIAL libre → atiende', () => {
    const turns = [
      { id: 600, tipoAtencion: 'General', assignedTurn: 600 }
    ];
    const result = selectTurnForCubicle(turns, 'SPECIAL');
    expect(result).not.toBeNull();
    expect(result.id).toBe(600);
  });
});

/**
 * Tests de regresión: routing SPECIAL/GENERAL en assignNextHolding (v2.8.55)
 *
 * Bug original (v2.8.54): isEspecialTurn() trataba como "especial" a todos los tipos
 * != General, lo cual rechazaba RiesgoCaida y PrioritarioRiesgo en cubículos GENERAL.
 * Resultado: pacientes RiesgoCaida quedaban varados sin asignación.
 *
 * Fix v2.8.55: requiresSpecialCubicle() solo es true para MuyEspecial.
 *
 * Estos tests cubren la lógica pura sin tocar Prisma. La función real
 * assignNextHolding está acoplada a BD; aquí replicamos el filtro crítico.
 */

import { requiresSpecialCubicle, isEspecialTurn } from '../lib/prioridadUtils.js';

describe('requiresSpecialCubicle — regla de routing v2.8.55', () => {
  test('MuyEspecial requiere cubículo SPECIAL', () => {
    expect(requiresSpecialCubicle('MuyEspecial')).toBe(true);
  });

  test('RiesgoCaida NO requiere SPECIAL (va a GENERAL — bug original)', () => {
    expect(requiresSpecialCubicle('RiesgoCaida')).toBe(false);
  });

  test('PrioritarioRiesgo NO requiere SPECIAL', () => {
    expect(requiresSpecialCubicle('PrioritarioRiesgo')).toBe(false);
  });

  test('Prioritario NO requiere SPECIAL', () => {
    expect(requiresSpecialCubicle('Prioritario')).toBe(false);
  });

  test('General NO requiere SPECIAL', () => {
    expect(requiresSpecialCubicle('General')).toBe(false);
  });

  test('isEspecialTurn es alias de requiresSpecialCubicle (compat)', () => {
    expect(isEspecialTurn('MuyEspecial')).toBe(true);
    expect(isEspecialTurn('RiesgoCaida')).toBe(false);
    expect(isEspecialTurn('General')).toBe(false);
  });
});

/**
 * Replica de la lógica de filtrado de assignNextHolding (lib/holdingUtils.js:217-258)
 * Aislada para testing sin BD.
 */
function selectTurnForCubicle(turns, cubicleType) {
  const hasMuyEspecialPending = turns.some(t => t.tipoAtencion === 'MuyEspecial');
  for (const turn of turns) {
    const needsSpecial = requiresSpecialCubicle(turn.tipoAtencion);
    if (cubicleType === 'GENERAL' && needsSpecial) continue;
    if (cubicleType === 'SPECIAL' && !needsSpecial && hasMuyEspecialPending) continue;
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

  test('CASO 4: PrioritarioRiesgo en cola + cub GENERAL → asigna (no es bug)', () => {
    const turns = [
      { id: 200, tipoAtencion: 'PrioritarioRiesgo', assignedTurn: 200 }
    ];
    const result = selectTurnForCubicle(turns, 'GENERAL');
    expect(result).not.toBeNull();
    expect(result.id).toBe(200);
  });

  test('CASO 5: Solo General en cola + cub SPECIAL → asigna (SPECIAL atiende General si no hay MuyEspecial)', () => {
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
});

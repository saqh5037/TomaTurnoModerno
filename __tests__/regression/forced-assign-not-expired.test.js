/**
 * Regresión v2.8.52 — bug Carlos 2026-04-29
 *
 * Garantía: releaseExpiredHoldings NO libera holdings con forcedAssign=true,
 * aunque hayan superado el timeout de 5 min. El admin asignó conscientemente,
 * la asignación queda hasta que el flebotomista la atienda o el admin la cancele.
 */

const mockPrisma = {
  turnRequest: {
    updateMany: jest.fn(),
  },
};

jest.mock('../../lib/prisma.js', () => ({
  __esModule: true,
  default: mockPrisma,
}));

jest.mock('../../lib/prioridadUtils.js', () => ({
  __esModule: true,
  CUBICULOS_POR_TIPO: {},
  saltaFila: () => false,
}));

const { releaseExpiredHoldings } = require('../../lib/holdingUtils.js');

describe('releaseExpiredHoldings respeta forcedAssign', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('updateMany debe filtrar forcedAssign:false en el WHERE', async () => {
    mockPrisma.turnRequest.updateMany.mockResolvedValue({ count: 3 });

    await releaseExpiredHoldings();

    expect(mockPrisma.turnRequest.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'Pending',
          holdingAt: expect.objectContaining({ lt: expect.any(Date) }),
          holdingBy: { not: null },
          forcedAssign: false, // CRÍTICO: este filtro impide liberar asignaciones admin
        }),
        data: {
          holdingBy: null,
          holdingAt: null,
        },
      })
    );
  });

  test('retorna el count de turnos liberados', async () => {
    mockPrisma.turnRequest.updateMany.mockResolvedValue({ count: 2 });
    const count = await releaseExpiredHoldings();
    expect(count).toBe(2);
  });
});

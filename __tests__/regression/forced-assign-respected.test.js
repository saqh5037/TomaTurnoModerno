/**
 * Regresión v2.8.52 — bug Carlos 2026-04-29
 * "La asignación manual del admin no se respeta — manda otro paciente"
 *
 * Garantía: si admin setea holdingBy + forcedAssign=true, assignNextHolding
 * NUNCA hace swap por prioridad. Devuelve siempre el paciente asignado por admin.
 */

const mockPrisma = {
  turnRequest: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    findUnique: jest.fn(),
  },
  cubicle: {
    findUnique: jest.fn(),
  },
  session: {
    findFirst: jest.fn(),
  },
  $transaction: jest.fn(),
  $queryRaw: jest.fn(),
};

jest.mock('../../lib/prisma.js', () => ({
  __esModule: true,
  default: mockPrisma,
}));

// Mock de prioridadUtils para no depender de su lógica concreta en estos tests
jest.mock('../../lib/prioridadUtils.js', () => ({
  __esModule: true,
  CUBICULOS_POR_TIPO: {
    MuyEspecial: ['6'],
    PrioritarioRiesgo: ['1', '2'],
  },
  saltaFila: (tipo) => ['MuyEspecial', 'Prioritario', 'PrioritarioRiesgo'].includes(tipo),
}));

const { assignNextHolding } = require('../../lib/holdingUtils.js');

describe('forcedAssign respeta asignación manual del admin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.turnRequest.updateMany.mockResolvedValue({ count: 0 });
  });

  test('si holding actual tiene forcedAssign=true, NO hace swap aunque haya Prioritario disponible', async () => {
    const adminAssignedTurn = {
      id: 104524,
      patientName: 'Juan Pérez',
      tipoAtencion: 'General',
      status: 'Pending',
      holdingBy: 10,
      holdingAt: new Date(),
      forcedAssign: true,
      cubicle: null,
    };
    mockPrisma.turnRequest.findMany.mockResolvedValueOnce([adminAssignedTurn]);

    const result = await assignNextHolding(10);

    expect(result).not.toBeNull();
    expect(result.id).toBe(104524);
    expect(result.tipoAtencion).toBe('General');
    // Solo se ejecutó la query de cola — el swap NO buscó alternativa
    expect(mockPrisma.turnRequest.findFirst).not.toHaveBeenCalled();
    // No se liberó el holding
    expect(mockPrisma.turnRequest.update).not.toHaveBeenCalled();
  });

  test('si holding actual es MuyEspecial forcedAssign=true, lo respeta (caso trivial)', async () => {
    const adminPriorityTurn = {
      id: 500,
      tipoAtencion: 'MuyEspecial',
      status: 'Pending',
      holdingBy: 10,
      holdingAt: new Date(),
      forcedAssign: true,
      cubicle: null,
    };
    mockPrisma.turnRequest.findMany.mockResolvedValueOnce([adminPriorityTurn]);

    const result = await assignNextHolding(10);

    expect(result.id).toBe(500);
    expect(result.isSpecial).toBe(true);
    expect(mockPrisma.turnRequest.findFirst).not.toHaveBeenCalled();
  });

  test('si holding actual tiene forcedAssign=false (asignado automático), permite el swap por prioridad', async () => {
    const autoAssignedTurn = {
      id: 200,
      tipoAtencion: 'General',
      status: 'Pending',
      holdingBy: 10,
      holdingAt: new Date(),
      forcedAssign: false,
      cubicle: null,
    };
    const higherPriorityTurn = {
      id: 300,
      tipoAtencion: 'Prioritario',
      status: 'Pending',
      holdingBy: null,
    };
    mockPrisma.turnRequest.findMany.mockResolvedValueOnce([autoAssignedTurn]);
    mockPrisma.turnRequest.findFirst
      .mockResolvedValueOnce(higherPriorityTurn) // higher priority disponible
      .mockResolvedValueOnce(null); // no inProgress
    mockPrisma.turnRequest.update.mockResolvedValue({});
    mockPrisma.session.findFirst.mockResolvedValue(null);
    mockPrisma.$transaction.mockImplementation(async (cb) => {
      const tx = {
        $queryRaw: jest.fn().mockResolvedValue([{ id: 300, tipoAtencion: 'Prioritario' }]),
        turnRequest: {
          update: jest.fn().mockResolvedValue({
            ...higherPriorityTurn,
            holdingBy: 10,
            holdingAt: new Date(),
            cubicle: null,
          }),
        },
      };
      return cb(tx);
    });

    const result = await assignNextHolding(10);

    // El swap SÍ se ejecutó: liberó el holding de 200
    expect(mockPrisma.turnRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 200 },
        data: { holdingBy: null, holdingAt: null },
      })
    );
    expect(result).not.toBeNull();
  });

  test('cola FIFO: con múltiples holdings forced, devuelve el más antiguo (holdingAt menor)', async () => {
    // v2.8.53 — Samuel pidió FIFO multi-paciente por flebo
    const oldest = {
      id: 1001,
      patientName: 'A',
      tipoAtencion: 'General',
      status: 'Pending',
      holdingBy: 10,
      holdingAt: new Date('2026-05-12T10:00:00Z'),
      forcedAssign: true,
      cubicle: null,
    };
    const middle = {
      id: 1002,
      patientName: 'B',
      tipoAtencion: 'General',
      status: 'Pending',
      holdingBy: 10,
      holdingAt: new Date('2026-05-12T10:01:00Z'),
      forcedAssign: true,
      cubicle: null,
    };
    const newest = {
      id: 1003,
      patientName: 'C',
      tipoAtencion: 'General',
      status: 'Pending',
      holdingBy: 10,
      holdingAt: new Date('2026-05-12T10:02:00Z'),
      forcedAssign: true,
      cubicle: null,
    };
    // Backend ordena por holdingAt ASC y devuelve la cola completa
    mockPrisma.turnRequest.findMany.mockResolvedValueOnce([oldest, middle, newest]);

    const result = await assignNextHolding(10);

    expect(result).not.toBeNull();
    expect(result.id).toBe(1001); // el más antiguo
    expect(result.patientName).toBe('A');
    // Nunca se hizo swap aunque hubiera prioritarios disponibles
    expect(mockPrisma.turnRequest.findFirst).not.toHaveBeenCalled();
    expect(mockPrisma.turnRequest.update).not.toHaveBeenCalled();
  });

  test('cola FIFO: hasAnyForced=true bloquea swap aun cuando hay un holding auto en la cola', async () => {
    const forcedOld = {
      id: 2001,
      tipoAtencion: 'General',
      status: 'Pending',
      holdingBy: 10,
      holdingAt: new Date('2026-05-12T09:00:00Z'),
      forcedAssign: true,
      cubicle: null,
    };
    const autoLater = {
      id: 2002,
      tipoAtencion: 'General',
      status: 'Pending',
      holdingBy: 10,
      holdingAt: new Date('2026-05-12T09:05:00Z'),
      forcedAssign: false,
      cubicle: null,
    };
    mockPrisma.turnRequest.findMany.mockResolvedValueOnce([forcedOld, autoLater]);

    const result = await assignNextHolding(10);

    expect(result.id).toBe(2001);
    // Aunque haya un auto en la cola, el hasAnyForced=true bloquea el swap
    expect(mockPrisma.turnRequest.findFirst).not.toHaveBeenCalled();
  });
});

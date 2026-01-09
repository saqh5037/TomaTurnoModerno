import prisma from "./prisma.js";

// Timeout de holding en minutos
const HOLDING_TIMEOUT_MINUTES = 5;

/**
 * Libera todos los turnos en holding que han expirado (más de 5 minutos sin ser llamados)
 * Esta función debe llamarse antes de asignar nuevos holdings o listar turnos
 * @returns {Promise<number>} Número de turnos liberados
 */
export async function releaseExpiredHoldings() {
  const timeoutDate = new Date(Date.now() - HOLDING_TIMEOUT_MINUTES * 60 * 1000);

  const result = await prisma.turnRequest.updateMany({
    where: {
      status: "Pending",
      holdingAt: { lt: timeoutDate },
      holdingBy: { not: null },
    },
    data: {
      holdingBy: null,
      holdingAt: null,
    },
  });

  if (result.count > 0) {
    console.log(`[HoldingUtils] Liberados ${result.count} turnos con holding expirado`);
  }

  return result.count;
}

/**
 * Libera todos los turnos en holding de un usuario específico
 * Usado cuando el usuario sale de la página o hace logout
 * @param {number} userId - ID del usuario
 * @returns {Promise<number>} Número de turnos liberados
 */
export async function releaseUserHoldings(userId) {
  if (!userId) return 0;

  const result = await prisma.turnRequest.updateMany({
    where: {
      status: "Pending",
      holdingBy: userId,
    },
    data: {
      holdingBy: null,
      holdingAt: null,
    },
  });

  if (result.count > 0) {
    console.log(`[HoldingUtils] Liberados ${result.count} turnos en holding del usuario ${userId}`);
  }

  return result.count;
}

/**
 * Busca y asigna el siguiente turno disponible a un flebotomista
 * Respeta la prioridad: Special > General, y dentro de cada grupo por orden de llegada
 * @param {number} userId - ID del flebotomista
 * @returns {Promise<Object|null>} El turno asignado o null si no hay turnos disponibles
 */
export async function assignNextHolding(userId) {
  if (!userId) return null;

  // Primero limpiar holdings expirados
  await releaseExpiredHoldings();

  // Verificar si el usuario ya tiene un turno en holding
  const existingHolding = await prisma.turnRequest.findFirst({
    where: {
      status: "Pending",
      holdingBy: userId,
    },
    include: {
      cubicle: true,
    },
  });

  if (existingHolding) {
    console.log(`[HoldingUtils] Usuario ${userId} ya tiene turno ${existingHolding.id} en holding`);
    return existingHolding;
  }

  // Verificar si el usuario tiene un paciente en "In Progress"
  const inProgressTurn = await prisma.turnRequest.findFirst({
    where: {
      status: "In Progress",
      attendedBy: userId,
    },
  });

  if (inProgressTurn) {
    console.log(`[HoldingUtils] Usuario ${userId} tiene turno ${inProgressTurn.id} en atención, no asignar holding`);
    return null;
  }

  // Buscar el siguiente turno disponible usando transacción para evitar race conditions
  // Orden: MISMO que pantalla de espera (Special primero, luego por tiempo efectivo)
  const nextTurn = await prisma.$transaction(async (tx) => {
    // Buscar turno disponible usando MISMO orden que pantalla de espera
    const turns = await tx.$queryRaw`
      SELECT id FROM "TurnRequest"
      WHERE status = 'Pending' AND "holdingBy" IS NULL
      ORDER BY
        CASE WHEN "tipoAtencion" = 'Special' THEN 0 ELSE 1 END,
        COALESCE("deferredAt", "createdAt") ASC
      LIMIT 1
    `;

    if (!turns || turns.length === 0) {
      return null;
    }

    const turnId = turns[0].id;

    // Asignar el turno en holding
    const updatedTurn = await tx.turnRequest.update({
      where: {
        id: turnId,
        holdingBy: null, // Doble verificación para evitar race condition
      },
      data: {
        holdingBy: userId,
        holdingAt: new Date(),
      },
      include: {
        cubicle: true,
      },
    });

    console.log(`[HoldingUtils] Turno ${updatedTurn.id} asignado en holding al usuario ${userId}`);
    return updatedTurn;
  });

  return nextTurn;
}

/**
 * Obtiene el turno actualmente en holding para un usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object|null>} El turno en holding o null
 */
export async function getUserHoldingTurn(userId) {
  if (!userId) return null;

  // Primero limpiar expirados
  await releaseExpiredHoldings();

  const turn = await prisma.turnRequest.findFirst({
    where: {
      status: "Pending",
      holdingBy: userId,
    },
    include: {
      cubicle: true,
    },
  });

  return turn;
}

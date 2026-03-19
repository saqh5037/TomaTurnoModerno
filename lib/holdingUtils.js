import prisma from "./prisma.js";
import { CUBICULOS_POR_TIPO, saltaFila } from "./prioridadUtils.js";

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
    // Verificar si hay un paciente de mayor prioridad disponible para swap
    const currentSaltaFila = saltaFila(existingHolding.tipoAtencion);

    if (!currentSaltaFila) {
      // Holding actual es General o RiesgoCaida — verificar si hay uno que salte fila
      const higherPriorityAvailable = await prisma.turnRequest.findFirst({
        where: {
          status: "Pending",
          holdingBy: null,
          tipoAtencion: { in: ['MuyEspecial', 'Prioritario', 'PrioritarioRiesgo'] },
        },
      });

      if (higherPriorityAvailable) {
        console.log(`[HoldingUtils] Swap: liberando ${existingHolding.tipoAtencion} ${existingHolding.id} para asignar ${higherPriorityAvailable.tipoAtencion}`);
        await prisma.turnRequest.update({
          where: { id: existingHolding.id },
          data: { holdingBy: null, holdingAt: null },
        });
        // Caer al bloque de asignación de abajo
      } else {
        console.log(`[HoldingUtils] Usuario ${userId} ya tiene turno ${existingHolding.id} en holding`);
        return {
          ...existingHolding,
          isSpecial: saltaFila(existingHolding.tipoAtencion)
        };
      }
    } else {
      console.log(`[HoldingUtils] Usuario ${userId} ya tiene turno prioritario ${existingHolding.id} en holding`);
      return {
        ...existingHolding,
        isSpecial: true
      };
    }
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

  // Obtener el cubículo del flebotomista para ruteo inteligente
  const userSession = await prisma.session.findFirst({
    where: { userId, expiresAt: { gt: new Date() }, selectedCubicleId: { not: null } },
    select: { selectedCubicleId: true },
    orderBy: { lastActivity: 'desc' }
  });
  let cubicleName = null;
  if (userSession?.selectedCubicleId) {
    const cubicle = await prisma.cubicle.findUnique({
      where: { id: userSession.selectedCubicleId },
      select: { name: true }
    });
    cubicleName = cubicle?.name || null;
  }

  // Buscar el siguiente turno disponible con ruteo por cubículo
  const nextTurn = await prisma.$transaction(async (tx) => {
    // Buscar turno disponible — prioriza pacientes que requieren ESTE cubículo
    const turns = await tx.$queryRaw`
      SELECT id, "tipoAtencion" FROM "TurnRequest"
      WHERE status = 'Pending' AND "holdingBy" IS NULL
      ORDER BY
        CASE WHEN "tipoAtencion" = 'MuyEspecial' THEN 0 WHEN "tipoAtencion" IN ('Prioritario','PrioritarioRiesgo') THEN 1 ELSE 2 END,
        COALESCE("deferredAt", "createdAt") ASC
      LIMIT 10
    `;

    if (!turns || turns.length === 0) {
      return null;
    }

    // Seleccionar el turno considerando restricciones de cubículo
    // Prioriza pacientes compatibles con el cubículo, pero si no hay, toma el primero disponible
    let selectedTurnId = null;
    let fallbackTurnId = null;
    for (const turn of turns) {
      const preferidos = CUBICULOS_POR_TIPO[turn.tipoAtencion];
      if (preferidos) {
        // Paciente tiene PREFERENCIA de cubículo
        if (cubicleName && preferidos.map(String).includes(String(cubicleName))) {
          // Flebotomista está en un cubículo compatible — match perfecto
          selectedTurnId = turn.id;
          break;
        }
        // No es compatible — guardar como fallback si no hay mejor opción
        if (!fallbackTurnId) fallbackTurnId = turn.id;
        continue;
      }
      // Sin restricción de cubículo — asignar
      selectedTurnId = turn.id;
      break;
    }

    // Usar fallback si no se encontró match perfecto
    if (!selectedTurnId) {
      selectedTurnId = fallbackTurnId;
    }

    if (!selectedTurnId) {
      return null;
    }

    const turnId = selectedTurnId;

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

    console.log(`[HoldingUtils] Turno ${updatedTurn.id} (${updatedTurn.tipoAtencion}) asignado en holding al usuario ${userId} (cubículo: ${cubicleName || 'sin'})`);
    return {
      ...updatedTurn,
      isSpecial: saltaFila(updatedTurn.tipoAtencion)
    };
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

  // Agregar isSpecial derivado de tipoAtencion para el frontend
  if (turn) {
    return {
      ...turn,
      isSpecial: saltaFila(turn.tipoAtencion)
    };
  }

  return turn;
}

import prisma from "./prisma.js";
import { CUBICULOS_POR_TIPO, saltaFila, requiresSpecialCubicle, cubicleMatchesPreferred } from "./prioridadUtils.js";

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
      forcedAssign: false, // Asignaciones manuales del admin nunca se liberan por timeout
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
      forcedAssign: false,
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

  // Resolve the phlebotomist's current cubicle EARLY — needed by both the swap
  // branch below and the main assignment block (prevents TDZ ReferenceError).
  const userSession = await prisma.session.findFirst({
    where: { userId, expiresAt: { gt: new Date() }, selectedCubicleId: { not: null } },
    select: { selectedCubicleId: true },
    orderBy: { lastActivity: 'desc' }
  });
  let cubicleName = null;
  let cubicleType = 'GENERAL';
  if (userSession?.selectedCubicleId) {
    const cubicle = await prisma.cubicle.findUnique({
      where: { id: userSession.selectedCubicleId },
      select: { name: true, type: true }
    });
    cubicleName = cubicle?.name || null;
    cubicleType = cubicle?.type || 'GENERAL';
  }

  // Obtener TODA la cola FIFO del usuario, ordenada por holdingAt ASC
  // FIFO: el más antiguo es el siguiente a procesar.
  const userQueue = await prisma.turnRequest.findMany({
    where: {
      status: "Pending",
      holdingBy: userId,
    },
    orderBy: { holdingAt: 'asc' },
    include: {
      cubicle: true,
    },
  });

  if (userQueue.length > 0) {
    const head = userQueue[0];
    const hasAnyForced = userQueue.some(t => t.forcedAssign);

    // Si HAY alguna asignación admin en la cola, NO se hace swap por prioridad.
    // La cola manual del admin manda. Devolver el más antiguo.
    if (hasAnyForced) {
      console.log(`[HoldingUtils] Usuario ${userId} tiene cola FIFO (${userQueue.length}, con forcedAssign), devolviendo más antiguo ${head.id}`);
      return {
        ...head,
        isSpecial: saltaFila(head.tipoAtencion)
      };
    }

    // Solo hay un holding auto-asignado (sin forced): aplica regla de swap por prioridad.
    // Si hay más de uno auto-asignado (edge case raro), respetamos el más antiguo igual.
    if (userQueue.length > 1) {
      console.log(`[HoldingUtils] Usuario ${userId} tiene ${userQueue.length} holdings auto, devolviendo FIFO ${head.id}`);
      return {
        ...head,
        isSpecial: saltaFila(head.tipoAtencion)
      };
    }

    const existingHolding = head;
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
      } else if (cubicleType === 'SPECIAL' && !requiresSpecialCubicle(existingHolding.tipoAtencion)) {
        // FX3: Cubículo SPECIAL con general en holding — verificar si hay especial esperando
        const especialAvailable = await prisma.turnRequest.findFirst({
          where: {
            status: "Pending",
            holdingBy: null,
            tipoAtencion: { not: 'General' },
          },
        });
        if (especialAvailable) {
          console.log(`[HoldingUtils] Swap SPECIAL: liberando General ${existingHolding.id} para asignar ${especialAvailable.tipoAtencion} ${especialAvailable.id}`);
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

  // Buscar el siguiente turno disponible con ruteo por cubículo
  const nextTurn = await prisma.$transaction(async (tx) => {
    // Buscar turno disponible — prioriza pacientes que requieren ESTE cubículo
    const turns = await tx.$queryRaw`
      SELECT id, "tipoAtencion" FROM "TurnRequest"
      WHERE status = 'Pending' AND "holdingBy" IS NULL
      ORDER BY
        CASE WHEN "tipoAtencion" = 'MuyEspecial' THEN 0 WHEN "tipoAtencion" IN ('Prioritario','PrioritarioRiesgo') THEN 1 ELSE 2 END,
        COALESCE("deferredAt", "createdAt") ASC
    `;

    if (!turns || turns.length === 0) {
      return null;
    }

    // FX3 (v2.8.56): Routing alineado al diagrama del docx.
    //   - MuyEspecial + Prioritario → cubículo SPECIAL (restricción dura)
    //   - RiesgoCaida + PrioritarioRiesgo → cubs 1, 2 GENERAL (preferencia)
    //   - General → cualquier cubículo, pero cubs SPECIAL solo si NO hay
    //     vulnerable que requiere SPECIAL esperando (evita que cub 6 atienda
    //     General mientras un Prioritario aguarda).
    const hasSpecialVulnerablePending = turns.some(t => requiresSpecialCubicle(t.tipoAtencion));

    let selectedTurnId = null;
    let fallbackTurnId = null;
    for (const turn of turns) {
      const needsSpecial = requiresSpecialCubicle(turn.tipoAtencion);

      // Restricción dura: cubículo GENERAL no atiende MuyEspecial ni Prioritario
      if (cubicleType === 'GENERAL' && needsSpecial) {
        continue;
      }
      // Restricción dura: cubículo SPECIAL no atiende General mientras haya
      // Prioritario/MuyEspecial esperando (reserva del cub para vulnerables).
      // NOTA: RiesgoCaida/PrioritarioRiesgo NO bloquean SPECIAL — ellos van
      // a cubs 1,2 GENERAL, no a SPECIAL. Si cub 6 está libre y solo hay un
      // RiesgoCaida esperando, cub 6 puede atender Generales sin problema.
      if (cubicleType === 'SPECIAL' && !needsSpecial && hasSpecialVulnerablePending) {
        continue;
      }

      const preferidos = CUBICULOS_POR_TIPO[turn.tipoAtencion];
      if (preferidos) {
        // Hard cubicle preference (MuyEspecial→cub6, PrioritarioRiesgo/RiesgoCaida→cubs1,2)
        if (cubicleName && cubicleMatchesPreferred(cubicleName, preferidos)) {
          selectedTurnId = turn.id;
          break;
        }
        // Not a match — save as fallback, but RiesgoCaida must NOT become a
        // general fallback (it has a cubicle restriction; if no compatible
        // cubicle is free it should wait, not go to any random cubicle).
        if (turn.tipoAtencion !== 'RiesgoCaida' && !fallbackTurnId) fallbackTurnId = turn.id;
        continue;
      }
      // Sin restricción de cubículo (General) — asignar
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

    console.log(`[HoldingUtils] Turno ${updatedTurn.id} (${updatedTurn.tipoAtencion}) asignado en holding al usuario ${userId} (cubículo: ${cubicleName || 'sin'}, tipo: ${cubicleType})`);
    return {
      ...updatedTurn,
      isSpecial: saltaFila(updatedTurn.tipoAtencion)
    };
  });

  return nextTurn;
}

/**
 * Obtiene el siguiente turno a procesar en la cola FIFO del usuario.
 * Si tiene varios holdings (cola manual del admin), devuelve el más antiguo por holdingAt.
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
    orderBy: { holdingAt: 'asc' },
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

/**
 * Obtiene la cola FIFO completa de holdings de un flebotomista.
 * Ordenada por holdingAt ASC: el más antiguo es el siguiente a procesar.
 * @param {number} userId - ID del flebotomista
 * @returns {Promise<Array>} Array de turnos (vacío si no hay)
 */
export async function getUserHoldingQueue(userId) {
  if (!userId) return [];

  await releaseExpiredHoldings();

  const turns = await prisma.turnRequest.findMany({
    where: {
      status: "Pending",
      holdingBy: userId,
    },
    orderBy: { holdingAt: 'asc' },
    include: {
      cubicle: true,
    },
  });

  return turns.map(turn => ({
    ...turn,
    isSpecial: saltaFila(turn.tipoAtencion)
  }));
}

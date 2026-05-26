import prisma from "./prisma.js";

// Timeout de inactividad: 20 minutos
const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000;

/**
 * Releases cubicles from inactive sessions (no activity for 20+ minutes).
 * Guards against releasing cubicles for users currently attending a patient
 * (TurnRequest with status 'In Progress'), because those sessions' lastActivity
 * may be stale even though the phlebotomist is actively working.
 *
 * @returns {Promise<number>} Number of cubicles released
 */
export async function releaseInactiveCubicles() {
  const inactiveThreshold = new Date(Date.now() - INACTIVITY_TIMEOUT_MS);

  // Find users currently attending a patient — never release their cubicle.
  const attending = await prisma.turnRequest.findMany({
    where: { status: "In Progress", attendedBy: { not: null } },
    select: { attendedBy: true },
    distinct: ["attendedBy"],
  });
  const attendingIds = attending.map((t) => t.attendedBy).filter(Boolean);

  const result = await prisma.session.updateMany({
    where: {
      lastActivity: { lt: inactiveThreshold },
      selectedCubicleId: { not: null },
      userId: { notIn: attendingIds.length ? attendingIds : [-1] },
    },
    data: {
      selectedCubicleId: null,
    },
  });

  if (result.count > 0) {
    console.log(
      `[CubicleCleanup] Released ${result.count} cubicle(s) from inactive sessions (>20 min, not attending)`
    );
  }

  return result.count;
}

/**
 * Libera cubículos de sesiones ya expiradas (expiresAt < NOW)
 * @returns {Promise<number>} Número de cubículos liberados
 */
export async function releaseExpiredCubicles() {
  const now = new Date();

  const result = await prisma.session.updateMany({
    where: {
      expiresAt: { lt: now },
      selectedCubicleId: { not: null }
    },
    data: {
      selectedCubicleId: null
    }
  });

  if (result.count > 0) {
    console.log(`[CubicleCleanup] Liberados ${result.count} cubículos de sesiones expiradas`);
  }

  return result.count;
}

/**
 * Ejecuta ambas limpiezas: expiradas e inactivas
 * Llamar antes de consultar o asignar cubículos
 * @returns {Promise<{expired: number, inactive: number}>}
 */
export async function cleanupCubicles() {
  const expired = await releaseExpiredCubicles();
  const inactive = await releaseInactiveCubicles();
  return { expired, inactive };
}

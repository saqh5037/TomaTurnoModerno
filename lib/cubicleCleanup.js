import prisma from "./prisma.js";

// Timeout de inactividad: 20 minutos
const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000;

/**
 * Libera cubículos de sesiones inactivas (sin actividad por 20+ minutos)
 * @returns {Promise<number>} Número de cubículos liberados
 */
export async function releaseInactiveCubicles() {
  const inactiveThreshold = new Date(Date.now() - INACTIVITY_TIMEOUT_MS);

  const result = await prisma.session.updateMany({
    where: {
      lastActivity: { lt: inactiveThreshold },
      selectedCubicleId: { not: null }
    },
    data: {
      selectedCubicleId: null
    }
  });

  if (result.count > 0) {
    console.log(`[CubicleCleanup] Liberados ${result.count} cubículos de sesiones inactivas (>20 min sin actividad)`);
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

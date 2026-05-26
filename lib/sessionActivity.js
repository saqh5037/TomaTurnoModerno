import prisma from "./prisma.js";

/**
 * Bumps lastActivity for the user's active session(s) so the cubicle-cleanup
 * inactivity timer reflects real work (patient actions), not just the fragile
 * 60s client heartbeat. Safe no-op if userId is missing or invalid.
 *
 * @param {number|string|null|undefined} userId
 * @returns {Promise<number>} Number of sessions updated (0 = no-op)
 */
export async function touchSessionActivity(userId) {
  const uid = parseInt(userId, 10);
  if (!uid || Number.isNaN(uid)) return 0;
  const result = await prisma.session.updateMany({
    where: { userId: uid, expiresAt: { gt: new Date() } },
    data: { lastActivity: new Date() },
  });
  return result.count;
}

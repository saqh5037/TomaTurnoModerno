import bcrypt from 'bcryptjs';
import { validatePassword } from './passwordPolicy.js';

/**
 * Construye el objeto de actualización de Prisma para un cambio de
 * contraseña administrativo. Además de hashear la contraseña, limpia
 * failedAttempts/lockedUntil para que un admin pueda desbloquear a un
 * usuario simplemente asignándole una nueva contraseña.
 *
 * @param {string} password - contraseña en texto plano, ya validada por el caller
 * @returns {Promise<{ password: string, passwordChangedAt: Date, failedAttempts: number, lockedUntil: null }>}
 */
export async function buildPasswordUpdateData(password) {
  const { valid, message } = validatePassword(password);
  if (!valid) {
    throw new Error(message);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return {
    password: hashedPassword,
    passwordChangedAt: new Date(),
    failedAttempts: 0,
    lockedUntil: null,
  };
}

/**
 * Política de contraseñas compartida (cliente + servidor).
 * No importar nada server-only aquí (bcrypt, prisma, etc.) para poder
 * usarlo tal cual desde pages/users/index.js en el navegador.
 */

// Mínimo 8 caracteres, al menos una minúscula, una mayúscula y un número.
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const PASSWORD_POLICY_MESSAGE =
  'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';

/**
 * Valida una contraseña contra la política del sistema.
 * @param {string} password
 * @returns {{ valid: boolean, message: string|null }}
 */
export function validatePassword(password) {
  if (!password || !PASSWORD_REGEX.test(password)) {
    return { valid: false, message: PASSWORD_POLICY_MESSAGE };
  }
  return { valid: true, message: null };
}

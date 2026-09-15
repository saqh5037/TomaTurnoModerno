import { randomInt } from 'node:crypto';

// Se excluyen caracteres ambiguos (0/O/o, 1/l/I/i) y símbolos que son
// teclas muertas o incómodas en teclados latinoamericanos (^, ~, `).
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghjkmnpqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '!#$%*+?';
const ALL = UPPER + LOWER + DIGITS + SYMBOLS;

const LENGTH = 12;

function pickRandom(charset) {
  return charset[randomInt(0, charset.length)];
}

// Fisher–Yates sin sesgo usando randomInt.
function shuffle(chars) {
  const arr = [...chars];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Genera una contraseña temporal legible y segura.
 * Garantiza al menos una mayúscula, una minúscula, un dígito y un símbolo,
 * sin caracteres ambiguos ni símbolos difíciles de teclear.
 * @returns {string}
 */
export function generateTemporaryPassword() {
  const required = [
    pickRandom(UPPER),
    pickRandom(LOWER),
    pickRandom(DIGITS),
    pickRandom(SYMBOLS),
  ];

  const rest = [];
  for (let i = required.length; i < LENGTH; i++) {
    rest.push(pickRandom(ALL));
  }

  return shuffle([...required, ...rest]).join('');
}

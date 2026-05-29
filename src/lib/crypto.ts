/**
 * Encriptación AES-256-GCM para datos sensibles de pedidos.
 *
 * Uso:
 *   const cifrado = encrypt('942749703');
 *   const original = decrypt(cifrado); // '942749703'
 *
 * La clave maestra se toma de ENCRYPTION_KEY (env var, 32 bytes en hex).
 * Si no está configurada en dev, usa una clave de fallback (solo local).
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits — recomendado para GCM (tag length 16 bytes es default de Node crypto)

function getMasterKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (hex && hex.length === 64) {
    return Buffer.from(hex, 'hex');
  }
  // Fallback solo para desarrollo local — NO usar en producción
  if (process.env.NODE_ENV !== 'production') {
    return Buffer.from('0'.repeat(64), 'hex');
  }
  throw new Error('ENCRYPTION_KEY no configurada en producción');
}

/**
 * Encripta un string y retorna "iv:tag:ciphertext" en hex.
 * Retorna null si el input es falsy para facilitar campos opcionales.
 */
export function encrypt(plaintext: string): string | null {
  if (!plaintext) return null;
  try {
    const key = getMasterKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':');
  } catch (err) {
    console.error('[crypto] Error encriptando:', err);
    return null;
  }
}

/**
 * Desencripta un string en formato "iv:tag:ciphertext".
 * Retorna null si falla la autenticación o el formato es inválido.
 */
export function decrypt(ciphertext: string | null | undefined): string | null {
  if (!ciphertext) return null;
  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) return null;

    const [ivHex, tagHex, encHex] = parts;
    const key = getMasterKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(encHex, 'hex');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
  } catch {
    // Falla silenciosa — datos corruptos o key incorrecta
    return null;
  }
}

/**
 * Retorna true si el string parece estar encriptado (formato iv:tag:cipher).
 * Útil para migración gradual de datos existentes.
 */
export function isEncrypted(value: string | null | undefined): boolean {
  if (!value) return false;
  const parts = value.split(':');
  return parts.length === 3 && parts.every((p) => /^[0-9a-f]+$/i.test(p));
}

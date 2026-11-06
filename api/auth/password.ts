import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Hash de contraseñas con scrypt (solo Node, sin dependencias nativas).
// Formato guardado: scrypt$<salt hex>$<hash hex>
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const parts = stored.split("$");
    if (parts.length !== 3 || parts[0] !== "scrypt") return false;
    const [, salt, expectedHex] = parts;
    const expected = Buffer.from(expectedHex, "hex");
    const actual = scryptSync(password, salt, 64);
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

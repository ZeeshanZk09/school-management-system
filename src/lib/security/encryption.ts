import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import { env } from "@/lib/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * Derives a 32-byte key from AUTH_SECRET for AES-256-GCM encryption.
 */
function getEncryptionKey(): Buffer {
  const secret = env.AUTH_SECRET;
  // Use first 32 bytes of the secret, padded if needed
  const key = Buffer.alloc(32);
  Buffer.from(secret, "utf-8").copy(key);
  return key;
}

/**
 * Encrypts plaintext using AES-256-GCM.
 * Returns a base64 string containing IV + ciphertext + auth tag.
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf-8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // Format: IV (12 bytes) + encrypted data + auth tag (16 bytes)
  const result = Buffer.concat([iv, encrypted, tag]);
  return result.toString("base64");
}

/**
 * Decrypts a base64 string produced by `encrypt()`.
 */
export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const data = Buffer.from(ciphertext, "base64");

  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(data.length - TAG_LENGTH);
  const encrypted = data.subarray(IV_LENGTH, data.length - TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf-8");
}

import { randomInt } from "crypto";
import bcrypt from "bcryptjs";
import { OTP } from "@/lib/constants";

/**
 * OTP utilities.
 *
 * Codes are generated with a CSPRNG (crypto.randomInt, never Math.random),
 * stored only as a bcrypt hash, and compared in constant time.
 */

/** Generate a zero-padded numeric OTP of `OTP.LENGTH` digits. */
export function generateOtp(): string {
  const max = 10 ** OTP.LENGTH; // exclusive upper bound, e.g. 1_000_000
  return randomInt(0, max)
    .toString()
    .padStart(OTP.LENGTH, "0");
}

/** Hash an OTP for storage. The plaintext code is never persisted. */
export function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

/** Constant-time comparison of a candidate code against its stored hash. */
export function verifyOtp(candidate: string, hash: string): Promise<boolean> {
  return bcrypt.compare(candidate, hash);
}

/** Expiry timestamp for a freshly issued code. */
export function otpExpiry(): Date {
  return new Date(Date.now() + OTP.EXPIRY_MS);
}

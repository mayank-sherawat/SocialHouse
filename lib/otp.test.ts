import { describe, it, expect } from "vitest";
import { generateOtp, hashOtp, verifyOtp } from "@/lib/otp";
import { OTP } from "@/lib/constants";

describe("otp", () => {
  it("generates a zero-padded numeric code of the configured length", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateOtp();
      expect(code).toHaveLength(OTP.LENGTH);
      expect(code).toMatch(/^\d+$/);
    }
  });

  it("verifies a correct code against its hash", async () => {
    const code = generateOtp();
    const hash = await hashOtp(code);
    expect(hash).not.toBe(code); // never stores plaintext
    await expect(verifyOtp(code, hash)).resolves.toBe(true);
  });

  it("rejects an incorrect code", async () => {
    const hash = await hashOtp("123456");
    await expect(verifyOtp("654321", hash)).resolves.toBe(false);
  });
});

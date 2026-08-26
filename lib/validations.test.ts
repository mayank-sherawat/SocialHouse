import { describe, it, expect } from "vitest";
import { emailSchema, passwordSchema, signupSchema, settingsSchema } from "@/lib/validations";

describe("emailSchema", () => {
  it("trims and lowercases", () => {
    expect(emailSchema.parse("  User@Example.COM ")).toBe("user@example.com");
  });
  it("rejects invalid emails", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("enforces a minimum length", () => {
    expect(passwordSchema.safeParse("short").success).toBe(false);
    expect(passwordSchema.safeParse("longenough1").success).toBe(true);
  });
});

describe("signupSchema", () => {
  const base = {
    email: "user@example.com",
    username: "valid_user",
    password: "supersecret",
    otp: "123456",
  };

  it("accepts a fully-valid payload", () => {
    expect(signupSchema.safeParse(base).success).toBe(true);
  });

  // Security regression guard: signup must not be possible without an OTP.
  it("rejects a payload with no otp", () => {
    const withoutOtp = { email: base.email, username: base.username, password: base.password };
    expect(signupSchema.safeParse(withoutOtp).success).toBe(false);
  });

  it("rejects a malformed otp", () => {
    expect(signupSchema.safeParse({ ...base, otp: "12" }).success).toBe(false);
  });
});

describe("settingsSchema", () => {
  it("rejects an empty update", () => {
    expect(settingsSchema.safeParse({}).success).toBe(false);
  });
  it("accepts a partial update", () => {
    expect(settingsSchema.safeParse({ bio: "hello" }).success).toBe(true);
  });
  it("rejects a new password without currentPassword", () => {
    expect(settingsSchema.safeParse({ password: "newpassword123" }).success).toBe(false);
  });
  it("accepts a new password with currentPassword", () => {
    expect(
      settingsSchema.safeParse({
        currentPassword: "oldpassword123",
        password: "newpassword123",
      }).success
    ).toBe(true);
  });
});
